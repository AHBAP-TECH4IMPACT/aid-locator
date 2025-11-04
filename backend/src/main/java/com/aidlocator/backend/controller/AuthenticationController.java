package com.aidlocator.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aidlocator.backend.auth.dtos.LoginUserDto;
import com.aidlocator.backend.auth.dtos.RegisterUserDto;
import com.aidlocator.backend.auth.entities.User;
import com.aidlocator.backend.auth.responses.LoginResponse;
import com.aidlocator.backend.auth.services.AuthenticationService;
import com.aidlocator.backend.auth.services.JwtService;
import com.aidlocator.backend.auth.services.RefreshTokenService;
import com.aidlocator.backend.constants.AidConstants;
import jakarta.servlet.http.HttpServletRequest;

@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final RefreshTokenService refreshTokenService;

	public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService,
			RefreshTokenService refreshTokenService) {
		this.jwtService = jwtService;
		this.authenticationService = authenticationService;
		this.refreshTokenService = refreshTokenService;
	}

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterUserDto registerUserDto) {
        User registeredUser = authenticationService.register(registerUserDto);
        if(registeredUser == null) {
        	return new ResponseEntity<>("{\"error\": \"User already exists\"}", HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        User authenticatedUser = authenticationService.authenticate(loginUserDto);
		if (authenticatedUser != null) {
			// if(AidConstants.APPROVED.equalsIgnoreCase(authenticatedUser.getStatus())) {
			String jwtToken = jwtService.generateToken(authenticatedUser);
			refreshTokenService.createRefreshToken(jwtToken, jwtService.getExpirationTime(), authenticatedUser);
			LoginResponse loginResponse = new LoginResponse().setToken(jwtToken)
					.setExpiresIn(jwtService.getExpirationTime());

			loginResponse.setUser(authenticatedUser);
			return ResponseEntity.ok(loginResponse);
			// }
			// LoginResponse errorResponse = new LoginResponse();
			// errorResponse.setError("Your login approval is pending, Please reach out to Admin for approval");
			// return new ResponseEntity<>(errorResponse,HttpStatus.BAD_REQUEST);
		}
		
		else {
			return new ResponseEntity<LoginResponse>(HttpStatus.UNAUTHORIZED);
		}

    }
    
    @PostMapping("/logout")
	public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader, HttpServletRequest request) {
		String requestToken = authHeader.replace("Bearer ", "");
		if (requestToken == null || requestToken.isBlank()) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
		String msg = "Logged out successfully";
		return findAndDeleteToken(requestToken, msg);
	}
    
    @PostMapping("/changePassword")
	public ResponseEntity<String> changePassword(@RequestHeader("Authorization") String authHeader, @RequestBody LoginUserDto loginUserDto, HttpServletRequest request) {
    	String requestToken = authHeader.replace("Bearer ", "");
    	if(request.getAttribute("userEmail") == null) {
    		return new ResponseEntity<String>(HttpStatus.BAD_REQUEST);
    	}
		LoginUserDto dto = new LoginUserDto();
		dto.setEmail((String) request.getAttribute("userEmail")).setPassword(loginUserDto.getPassword());
		User authenticatedUser = authenticationService.authenticate(dto);
		if (authenticatedUser == null) {
			return new ResponseEntity<String>(HttpStatus.UNAUTHORIZED);
		}
		authenticationService.updatePassword(loginUserDto,authenticatedUser);
		String msg = "Password updated,Please relogin with new password";
		return findAndDeleteToken(requestToken, msg);
	}
    
	private ResponseEntity<String> findAndDeleteToken(String requestToken, String msg) {
		return refreshTokenService.findByToken(requestToken).map(token -> {
			refreshTokenService.deleteRefreshToken(token);
			return ResponseEntity.ok(msg);
		}).orElse(ResponseEntity.badRequest().body("Invalid token"));
	}
}