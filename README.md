# Aid Locator

A modern monorepo project containing an Angular 20 frontend and Spring Boot backend for locating aid resources.

## Project Structure

```
aid-locator/                    # Parent Maven project
├── pom.xml                    # Parent POM with modules and dependency management
├── settings.xml               # Maven settings for corporate network compatibility
├── package.json               # Root package.json with monorepo scripts
├── start-dev.sh              # Development startup script
├── docker-compose.yml        # Docker containerization
├── .github/workflows/        # CI/CD pipeline
├── docker/                    # Docker configuration
│   ├── backend/Dockerfile     # Spring Boot container
│   ├── frontend/Dockerfile    # Angular + Nginx container
│   └── nginx/nginx.conf      # Nginx configuration for frontend
├── frontend/                  # Angular 20 application (Port 7200)
│   ├── package.json
│   └── src/
└── backend/                   # Spring Boot application (Port 8080) - Maven module
    ├── pom.xml               # Child POM inheriting from parent
    └── src/
```

## Technology Stack

### Frontend
- Angular 20
- TypeScript
- CSS3
- Bootstrap 5.3.8
- Node.js 22+
- Nginx Alpine (containerized)

### Backend
- Java 17
- Spring Boot 3.3.5
- Maven 3.6+ (Parent-Child project structure)
- Spring Web
- Spring Boot Actuator
- Eclipse Temurin JRE Alpine (containerized)

### Build System
- **Maven Multi-Module**: Parent project managing backend as child module
- **NPM Scripts**: Orchestration of frontend/backend development tasks
- **Custom Settings**: Corporate network compatible Maven repository configuration

## Getting Started

### Prerequisites
- Node.js 22.12+
- Java 17
- Maven 3.6+
- Docker & Docker Compose (for containerized deployment)

### Quick Start

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start both applications in development mode:**
   ```bash
   # Option 1: Use the convenience script
   ./start-dev.sh
   
   # Option 2: Use npm script
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:7200
   - Backend API: http://localhost:8080/api
   - Health Check: http://localhost:8080/actuator/health

### Docker Deployment

For production-like containerized deployment:

1. **Build and start containers:**
   ```bash
   npm run docker:build
   npm run docker:up
   ```

2. **Access the containerized application:**
   - Frontend: http://localhost:7200 (Nginx serving Angular app)
   - Backend API: http://localhost:8080/api (Spring Boot container)
   - Health Check: http://localhost:8080/actuator/health

3. **View logs and manage containers:**
   ```bash
   npm run docker:logs     # View container logs
   npm run docker:down     # Stop containers
   npm run docker:clean    # Stop containers and remove images
   ```

### Individual Application Setup

#### Frontend (Angular)
```bash
cd frontend
npm install
npm start
```

#### Backend (Spring Boot)  
```bash
# From root directory (recommended - uses parent Maven project)
npm run start:backend

# Or using Maven directly with custom settings
mvn spring-boot:run -pl backend -s settings.xml

# Or from backend directory (legacy method)
cd backend
mvn spring-boot:run -s ../settings.xml
```

## Available Scripts

From the root directory:

### Development
- `npm run dev` - Start both frontend and backend in development mode
- `npm run start:frontend` - Start only the Angular frontend
- `npm run start:backend` - Start only the Spring Boot backend (uses Maven parent project)

### Build & Test
- `npm run build` - Build both applications for production
- `npm run build:frontend` - Build only the Angular frontend
- `npm run build:backend` - Build only the Spring Boot backend (Maven parent project)
- `npm run test` - Run tests for both applications
- `npm run test:frontend` - Run only frontend tests
- `npm run test:backend` - Run only backend tests (Maven parent project)

### Dependencies
- `npm run install:all` - Install dependencies for both applications
- `npm run install:frontend` - Install only frontend dependencies
- `npm run install:backend` - Resolve only backend dependencies (Maven parent project)

### Docker Operations
- `npm run docker:build` - Build backend JAR and create Docker images
- `npm run docker:up` - Start containerized application
- `npm run docker:down` - Stop containers
- `npm run docker:logs` - View container logs
- `npm run docker:clean` - Stop containers and remove images

### Maven Commands (Alternative)
```bash
# All commands use the centralized settings.xml
mvn validate -s settings.xml                    # Validate project structure
mvn compile -s settings.xml                     # Compile all modules
mvn clean package -s settings.xml              # Build all modules
mvn spring-boot:run -pl backend -s settings.xml # Run backend module
mvn test -pl backend -s settings.xml           # Test backend module
```

## API Endpoints

- `GET /api/health` - Backend health check
- `GET /api/info` - Application information
- `GET /actuator/health` - Spring Boot Actuator health endpoint

## Development Features

- **Hot Reload**: Both frontend and backend support hot reload during development
- **CORS Configuration**: Pre-configured for seamless frontend-backend communication
- **Proxy Setup**: Angular dev server proxies API calls to Spring Boot backend
- **Monorepo Structure**: Organized codebase with centralized scripts

## CI/CD Pipeline

The project includes automated CI/CD via GitHub Actions ([`.github/workflows/ci-build.yml`](.github/workflows/ci-build.yml)):

### Pipeline Triggers
- **Pull Requests**: Tests and builds on all PRs to `main` branch
- **Pushes**: Tests, builds, and publishes container images on pushes to `main` or `develop`

### Pipeline Steps
1. **Setup Environment**: Node.js 22.12+ and Java 17
2. **Install Dependencies**: `npm run install:all` 
3. **Run Tests**: Both frontend (`npm run test:frontend`) and backend (`npm run test:backend`)
4. **Build Applications**: `npm run build`
5. **Build Container Images**: Creates Docker images for both frontend and backend
6. **Push to Registry**: Publishes images to GitHub Container Registry (ghcr.io)

### Container Images
Published images are tagged with:
- `{branch-name}-{commit-sha}`
- **Backend** [aid-locator-backend](https://github.com/AHBAP-TECH4IMPACT/aid-locator/pkgs/container/aid-locator-backend)
- **Frontend**: [aid-locator-frontend](https://github.com/AHBAP-TECH4IMPACT/aid-locator/pkgs/container/aid-locator-frontend)

### Using CI-Built Images
```bash
# Pull and run latest CI-built images
docker pull ghcr.io/ahbap-tech4impact/aid-locator-backend:develop-latest
docker pull ghcr.io/ahbap-tech4impact/aid-locator-frontend:develop-latest

# Run the containers
docker run -d -p 8080:8080 -e SPRING_PROFILES_ACTIVE=docker ghcr.io/ahbap-tech4impact/aid-locator-backend:develop-latest
docker run -d -p 7200:80 ghcr.io/ahbap-tech4impact/aid-locator-frontend:develop-latest
```

## Architecture

The application follows a modern full-stack architecture:

### Application Architecture
- **Frontend**: Angular 20 SPA serving the user interface on port 7200
- **Backend**: Spring Boot REST API serving data and business logic on port 8080
- **Proxy**: Angular dev server proxies `/api/*` requests to the backend
- **CORS**: Configured to allow requests from the frontend domain

### Build Architecture
- **Maven Parent Project**: `aid-locator` manages shared configuration and dependency versions
- **Maven Child Module**: `backend` inherits from parent, enabling centralized dependency management
- **NPM Orchestration**: Root package.json coordinates frontend (npm) and backend (maven) build tasks
- **Centralized Configuration**: Single `settings.xml` at root for Maven repository settings

### Benefits
- **Unified Dependency Management**: Parent POM manages Spring Boot versions centrally
- **Consistent Build Process**: Single command builds entire project with proper module ordering
- **Corporate Network Ready**: Centralized Maven settings handle proxy/repository configuration
- **Developer Experience**: Simple npm commands abstract complex Maven multi-module operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## License

This project is licensed under the MIT License.

### backend steps
1. Please download(https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) and run a postgres instance locally with db name "testdb" and password is "admin"
2. Use the register api and create one admin user by giving role as "admin"
3. run this query to make admin "approved" with thier emailid same as registration- 
"update users set status='approved' where email='<emailid>'"
4. You can now create another provider with the same registration api.
5. With the help of admin login created at the step 2, use the admin token from the admin login response and set as a auth bearer token to retrieve all providers and approve them using approver user api. you need to provide the provider's email and the status as "approved".
6. Once provider is approved. Login with provider and get the token. Provider can post/update the listing. By default listing is pending.
7. There is another api where you can retrieve your existing listings.
8. Admin has to get and approve all the listings.
9. You can search all the listings without any criteria.
10. You can also search with tags like 'food,water..'
11. Collection was also pushed as part of the backend code on the git repo

