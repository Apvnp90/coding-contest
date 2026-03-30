# Project Guidelines

## Implementation Philosophy

**Strict Requirement**: Implement ONLY what is explicitly requested. Do not add:
- Extra CRUD operations unless specifically asked
- Additional validation logic beyond what's mentioned
- Helper methods or convenience functions
- Duplicate checking or business logic validation unless specified

## When Creating Repository Classes

- Include only the methods that are directly required for the explicitly requested functionality
- Do not add `findBy*` or `existsBy*` methods unless explicitly requested
- Use only JpaRepository base methods (save, findById, findAll, deleteById) unless custom queries are specifically asked for

## When Creating Service Classes

- Implement only the operations explicitly mentioned in the requirements
- Do not add validation logic (duplicate checking, business rules) unless explicitly requested
- Keep service methods minimal and focused on the requested feature only

## General Guidelines

- If a requirement mentions "save", create only the save/create functionality
- If unsure whether to add a feature, DON'T add it—implement the minimum required
- Ask for clarification before adding any feature not explicitly mentioned
- Create a global exception handler while creating the project for the first time

## Project Standards

### Technology Stack
- Use REST API principles for all endpoints
- Use PostgreSQL as the database
- Always use DTO pattern (separate request/response DTOs). Create separate folder for request and response dto objects
- Include validation annotations on DTOs and entities
- Implement global exception handling with @RestControllerAdvice

### Naming Conventions
- **Service Interfaces**: Prefix with `I` (e.g., `IBuyerInfoService`)
- **Service Implementations**: Use class name without `I` (e.g., `BuyerInfoService`)
- **Database Tables**: Prefix with `tbl` (e.g., `tblBuyers`, `tblOrders`)

### Folder Structure
- Place service interfaces in: `interface/` folder
- Place service implementations in: `services/` folder
- Example:
  ```
  coding/context/compass/
    ├── interface/
    │   └── IBuyerInfoService.java
    └── services/
        └── BuyerInfoService.java
  ```

### What NOT to Include by Default
- Do NOT add duplicate checking unless explicitly requested
- Do NOT add extra finder methods in repositories unless specified
- Do NOT implement full CRUD if only save/create is requested

## Exception Handling Guidelines

### Backend Exception Handling (Spring Boot)

#### Custom Exceptions
- Create custom exceptions for business logic errors in `exception/` package
- Extend `RuntimeException` for unchecked exceptions
- Use descriptive names: `DuplicateUsernameException`, `InvalidCredentialsException`, `ResourceNotFoundException`

**Example Custom Exceptions:**
```java
public class DuplicateUsernameException extends RuntimeException {
    public DuplicateUsernameException(String message) {
        super(message);
    }
}

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
```

#### Global Exception Handler
- Create `GlobalExceptionHandler` class in `exception/` package
- Annotate with `@RestControllerAdvice`
- Add logger: `private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);`
- Handle specific exceptions with appropriate HTTP status codes
- Include request path and timestamp in error responses
- **Never expose internal error details or stack traces in production responses**

**Required Exception Handlers:**
- `MethodArgumentNotValidException` (400 Bad Request) - Validation errors
- Custom business exceptions (409 Conflict, 401 Unauthorized, etc.)
- `DataIntegrityViolationException` (409 Conflict) - Database constraint violations
- `AccessDeniedException` (403 Forbidden) - Security violations
- `BadCredentialsException` (401 Unauthorized) - Authentication failures
- `Exception` (500 Internal Server Error) - Generic fallback

**Global Exception Handler Template:**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        logger.warn("Validation failed for request: {}", request.getDescription(false));
        
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("errors", errors);
        response.put("path", request.getDescription(false).replace("uri=", ""));
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DuplicateUsernameException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateUsername(
            DuplicateUsernameException ex, WebRequest request) {
        
        logger.warn("Duplicate username attempt: {}", ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.CONFLICT.value());
        response.put("message", ex.getMessage());
        response.put("path", request.getDescription(false).replace("uri=", ""));
        
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, WebRequest request) {
        
        logger.error("Unhandled exception: {} | Request: {}", 
            ex.getMessage(), request.getDescription(false), ex);
        
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("message", "An unexpected error occurred. Please try again later.");
        response.put("path", request.getDescription(false).replace("uri=", ""));
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

#### Service Layer Exception Handling
- Throw custom exceptions for business logic errors
- Add logger to all service classes
- Log exceptions before throwing them
- Use descriptive exception messages

**Service Layer Pattern:**
```java
@Service
public class AuthService implements IAuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    @Override
    public AuthResponseDTO register(RegisterRequestDTO registerRequest) {
        logger.info("Attempting to register user: {}", registerRequest.getUsername());
        
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            logger.warn("Registration failed: username already exists - {}", registerRequest.getUsername());
            throw new DuplicateUsernameException("Username already exists");
        }
        
        // Business logic...
        logger.info("User registered successfully: {}", user.getUsername());
        return response;
    }
}
```

#### HTTP Status Code Standards
- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST (resource created)
- **400 Bad Request**: Validation errors, malformed request
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate resource, constraint violation
- **500 Internal Server Error**: Unexpected server error

#### Error Response Structure
All error responses should follow consistent structure:
```json
{
  "timestamp": "2026-03-29T10:15:30",
  "status": 400,
  "message": "Error message",
  "errors": {
    "field": "Field-specific error"
  },
  "path": "/api/endpoint"
}
```

### Frontend Exception Handling (React)

#### API Error Handling
- Wrap all API calls in try-catch blocks
- Handle HTTP error responses separately from network errors
- Display user-friendly error messages
- Use loggerService for error logging
- Never show technical error details to users

**API Call Pattern:**
```javascript
try {
  const response = await fetch(url, options);
  
  if (response.ok) {
    const data = await response.json();
    // Handle success
  } else {
    const errorData = await response.json();
    loggerService.error('API error', errorData.message, { status: response.status });
    setError(errorData.message || 'An error occurred');
  }
} catch (err) {
  loggerService.error('Network error', err, { url });
  setError('Network error. Please check your connection and try again.');
}
```

#### Error Boundary
- Use ErrorBoundary component to catch React rendering errors
- Log errors to Application Insights
- Display user-friendly fallback UI
- Provide reload/recovery option

### Exception Handling Best Practices

#### DO:
✅ Create custom exceptions for business logic errors
✅ Log all exceptions with appropriate severity levels
✅ Include request context in error logs (path, user, timestamp)
✅ Use appropriate HTTP status codes
✅ Return consistent error response structure
✅ Sanitize error messages before sending to client
✅ Handle specific exceptions before generic ones

#### DON'T:
❌ Expose stack traces in production error responses
❌ Use generic RuntimeException for business logic errors
❌ Return internal error messages to clients
❌ Log sensitive data (passwords, tokens, PII)
❌ Catch exceptions without handling them
❌ Return HTTP 200 with error message in body
❌ Skip logging in exception handlers

## PostgreSQL & Database Guidelines

### Configuration Standards
- Use `spring.jpa.hibernate.ddl-auto=update` for development
- Always set `spring.jpa.show-sql=true` and `spring.jpa.properties.hibernate.format_sql=true` for debugging
- Use PostgreSQL-specific dialect: `org.hibernate.dialect.PostgreSQLDialect`
- Default port configuration: Use 8081 to avoid conflicts with common services on 8080

### Entity Design
- Use `@GeneratedValue(strategy = GenerationType.IDENTITY)` for auto-generated IDs
- Use snake_case for database column names via `@Column(name = "column_name")`
- Always specify nullable constraints: `nullable = false` for required fields
- Set appropriate `@Size` constraints matching database column definitions
- Use `@Table(name = "tblTableName")` to explicitly name tables with "tbl" prefix (e.g., `tblBuyers`, `tblOrders`)

### Data Types Mapping
- String fields: Use `@Size(max = X)` - default VARCHAR(255) for short text
- Email: Use `@Email` validation with `@Size(max = 150)`
- Phone: Use String type with `@Size(max = 20)`
- Dates: Use `LocalDate` or `LocalDateTime` from `java.time` package (not `java.util.Date`)

### Repository Best Practices
- Extend `JpaRepository<Entity, ID>` for standard operations
- Do NOT add custom query methods unless explicitly requested
- Do NOT add `existsBy*` or `findBy*` methods unless specifically needed
- Use `@Repository` annotation on repository interfaces

### Transaction Management
- Service methods that modify data should be annotated with `@Transactional` if explicitly handling complex operations
- For simple save operations, rely on Spring Data JPA's default transaction handling
- Do NOT add `@Transactional` unless multi-step operations require it

### Query Guidelines
- Avoid N+1 problems: Use `@EntityGraph` or JOIN FETCH only when explicitly optimizing queries
- Do NOT write native SQL queries unless JPA/JPQL cannot achieve the requirement
- Prefer JPA method naming conventions over `@Query` annotations for simple queries

### Connection & Performance
- Use HikariCP (default in Spring Boot) - do not configure connection pool unless explicitly required
- Do NOT add database indexes unless performance optimization is explicitly requested
- Do NOT add caching (`@Cacheable`) unless explicitly requested

## Frontend Guidelines (React + Vite)
- implement proper routing with React Router and a dedicated routes file

### Project Structure
- Place components in: `src/components/` folder
- Each component should have its own CSS file with the same name (e.g., `Component.jsx` and `Component.css`)
- Keep components focused and single-purpose

### Component Standards
- Use functional components with hooks (useState, useEffect)
- Use descriptive prop names and destructure props in function parameters
- Handle loading states and error states explicitly in the UI

### API Integration
- Use fetch API for HTTP requests
- Always include error handling with try-catch blocks
- Use async/await for cleaner async code
- Display user-friendly error messages in the UI

### Styling Guidelines
- Design modern, responsive UI using CSS Flexbox or Grid
- Use media queries for mobile responsiveness
- Keep CSS modular and scoped to components (avoid global styles)
- Use consistent spacing, font sizes, and color schemes for a polished look
- Use clean and minimalistic design with soft shadows, smooth transitions, hover effects for a modern aesthetic
- Apply a light theme using css variables for easy theming and maintainability
- Generate CSS and HTML in separate sections
- Don't set the container and buttons with rounded edges
- Only highlight the button when hovered and don't add jump transition

### State Management
- Use useState for local component state
- Pass callback functions as props for parent-child communication
- Keep state as close to where it's used as possible

### Best Practices
- Do NOT add extra features or components unless explicitly requested
- Implement only the requested functionality
- Use meaningful variable and function names
- Add loading spinners for async operations
- Display success and error messages to users
- Include proper form validation when working with forms

## Logging Guidelines

**Standard Practice**: Use Azure Application Insights for centralized logging and monitoring in production applications.

### Azure Application Insights Setup (Required for New Projects)

#### Backend Setup (Spring Boot)

**1. Add Dependency to pom.xml:**
```xml
<dependency>
    <groupId>com.microsoft.azure</groupId>
    <artifactId>applicationinsights-spring-boot-starter</artifactId>
    <version>3.4.19</version>
</dependency>
```

**2. Configure in application.properties:**
```properties
# Azure Application Insights
azure.application-insights.connection-string=${APPLICATIONINSIGHTS_CONNECTION_STRING:}
```

**3. Set Environment Variable in Azure App Service:**
- Variable Name: `APPLICATIONINSIGHTS_CONNECTION_STRING`
- Value: Connection string from Azure Application Insights resource

#### Frontend Setup (React)

**1. Install Package:**
```bash
npm install @microsoft/applicationinsights-web
```

**2. Create `src/services/appInsights.js`:**
```javascript
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

let appInsights = null;
const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;

if (connectionString) {
  appInsights = new ApplicationInsights({
    config: {
      connectionString: connectionString,
      enableAutoRouteTracking: true,
      disableFetchTracking: false,
      disableAjaxTracking: false
    }
  });
  appInsights.loadAppInsights();
  appInsights.trackPageView();
}

export default appInsights;
```

**3. Initialize in main.jsx:**
```javascript
import './services/appInsights' // Add this import
```

**4. Set Environment Variable:**
- Create `.env.production` with: `VITE_APPINSIGHTS_CONNECTION_STRING=<connection-string>`
- Add same variable in Azure Static Web Apps Configuration

### Backend Logging (Spring Boot)

#### Logging Standards
- Use SLF4J logger with Logback (Spring Boot default)
- Add logger declaration at the top of each class: `private static final Logger logger = LoggerFactory.getLogger(ClassName.class);`
- Never use `System.out.println()` or `e.printStackTrace()` in production code
- Import: `import org.slf4j.Logger;` and `import org.slf4j.LoggerFactory;`
- Application Insights automatically captures all SLF4J logs

#### Log Levels Usage
- **ERROR**: For exceptions and errors that need immediate attention
- **WARN**: For potentially harmful situations or deprecated features
- **INFO**: For important business logic events (user login, data saved, etc.)
- **DEBUG**: For detailed diagnostic information (method entry/exit, variable values)
- **TRACE**: For very detailed debugging (SQL parameter binding, etc.)

#### What to Log
- Controller: Log incoming requests and responses
- Service: Log business logic execution (start/success/failure)
- Repository: Log only if custom queries are complex
- Exception Handler: Always log exceptions with stack traces
- Security: Log authentication attempts, authorization failures
- Important state changes: User registration, data creation/deletion

#### What NOT to Log
- Passwords, JWT tokens, or any credentials
- Full credit card numbers or sensitive PII
- Large response payloads (log IDs instead)
- Inside loops (causes log spam)
- Redundant information already in stack traces

#### Logging Patterns

**Controller Logging:**
```java
@RestController
public class BuyerInfoController {
    private static final Logger logger = LoggerFactory.getLogger(BuyerInfoController.class);
    
    @PostMapping("/api/buyer-info")
    public ResponseEntity<?> createBuyerInfo(@Valid @RequestBody BuyerInfoRequestDTO request) {
        logger.info("Creating buyer info for: {}", request.getFirstName());
        try {
            BuyerInfoResponseDTO response = service.saveBuyerInfo(request);
            logger.info("Buyer created successfully with ID: {}", response.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to create buyer info", e);
            throw e;
        }
    }
}
```

**Service Logging:**
```java
@Service
public class BuyerInfoService {
    private static final Logger logger = LoggerFactory.getLogger(BuyerInfoService.class);
    
    public BuyerInfoResponseDTO saveBuyerInfo(BuyerInfoRequestDTO request) {
        logger.debug("Saving buyer info: {}", request);
        try {
            // Business logic
            logger.info("Successfully saved buyer with ID: {}", saved.getId());
            return response;
        } catch (Exception e) {
            logger.error("Error saving buyer info for: {}", request.getFirstName(), e);
            throw new RuntimeException("Failed to save buyer", e);
        }
    }
}
```

**Exception Handler Logging:**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex, WebRequest request) {
        logger.error("Unhandled exception: {} | Request: {}", 
            ex.getMessage(), request.getDescription(false), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("An error occurred");
    }
}
```

#### Log Configuration (application.properties)
```properties
# Logging levels
logging.level.root=INFO
logging.level.coding.contest.testproject=DEBUG
logging.level.org.springframework.security=DEBUG

# Log file
logging.file.name=logs/buyer-info-api.log
logging.file.max-size=10MB
logging.file.max-history=30

# Console pattern
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

### Frontend Logging (React)

#### Logging Service
- Create a centralized `loggerService.js` in `src/services/`
- Use logger methods: `logger.error()`, `logger.warn()`, `logger.info()`, `logger.debug()`
- Never use `console.log()` directly in components
- Always include context (component name, user action, relevant data)
- Integrate with Application Insights to send logs to Azure

#### Frontend Logging Service Template

**loggerService.js with Application Insights:**
```javascript
import appInsights from './appInsights';

const loggerService = {
  error: (message, error, context = {}) => {
    console.error(`[ERROR] ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Send to Application Insights
    if (appInsights) {
      appInsights.trackException({
        exception: error instanceof Error ? error : new Error(message),
        properties: { message, ...context }
      });
    }
  },

  warn: (message, context = {}) => {
    console.warn(`[WARN] ${message}`, { context, timestamp: new Date().toISOString() });
    if (appInsights) {
      appInsights.trackTrace({
        message: `[WARN] ${message}`,
        severityLevel: 2,
        properties: context
      });
    }
  },

  info: (message, context = {}) => {
    console.info(`[INFO] ${message}`, { context, timestamp: new Date().toISOString() });
    if (appInsights) {
      appInsights.trackTrace({
        message: `[INFO] ${message}`,
        severityLevel: 1,
        properties: context
      });
    }
  },

  debug: (message, context = {}) => {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, { context });
    }
  }
};

export default loggerService;
```

#### Frontend Logging Patterns

**Component Logging:**
```javascript
import loggerService from '../services/loggerService';

const BuyerInfoDetails = () => {
  const handleSubmit = async (e) => {
    try {
      loggerService.info('Submitting buyer form', { firstName: formData.firstname });
      
      const response = await fetch(url, options);
      
      if (response.ok) {
        loggerService.info('Buyer saved successfully');
      } else {
        loggerService.error('Failed to save buyer', await response.text(), { 
          status: response.status 
        });
      }
    } catch (err) {
      loggerService.error('Network error', err, { apiUrl: API_URL });
    }
  };
};
```

#### Frontend Log Levels
- **error()**: API failures, network errors, exceptions
- **warn()**: Validation warnings, deprecated features
- **info()**: Successful operations, user actions
- **debug()**: Detailed debugging (development only)

#### Error Boundary
- Wrap main App component with ErrorBoundary
- Log all React errors to Application Insights via loggerService
- Display user-friendly error messages

**ErrorBoundary.jsx:**
```javascript
import React from 'react';
import appInsights from '../services/appInsights';

class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Send to Application Insights
    if (appInsights) {
      appInsights.trackException({
        exception: error,
        properties: { componentStack: errorInfo.componentStack }
      });
    }
  }
  // ... rest of component
}
```

### General Logging Principles

#### DO:
✅ Log at entry and exit of important operations
✅ Include correlation IDs for tracing requests
✅ Use parameterized logging: `logger.info("User {} logged in", username)`
✅ Log exceptions with full stack traces
✅ Include timestamps and thread information
✅ Use appropriate log levels
✅ Sanitize sensitive data before logging

#### DON'T:
❌ Log passwords, tokens, or API keys
❌ Log inside loops or high-frequency methods
❌ Use string concatenation in log statements
❌ Log duplicate information
❌ Leave debug logs in production
❌ Ignore exceptions silently
❌ Log entire objects with sensitive fields

### Production Logging with Application Insights

#### What Application Insights Automatically Tracks:
- **Backend**: HTTP requests/responses, database queries, exceptions, dependencies, performance metrics
- **Frontend**: Page views, AJAX/Fetch requests, JavaScript errors, page load performance
- **End-to-end correlation**: Tracks requests from frontend → backend → database

#### Configuration Checklist:
- ✅ Create Application Insights resource in Azure Portal
- ✅ Copy connection string from Azure Portal
- ✅ Set `APPLICATIONINSIGHTS_CONNECTION_STRING` in Azure App Service (Backend)
- ✅ Set `VITE_APPINSIGHTS_CONNECTION_STRING` in Azure Static Web Apps (Frontend)
- ✅ Add Application Insights dependency to pom.xml
- ✅ Install `@microsoft/applicationinsights-web` npm package
- ✅ Create `appInsights.js` and import in main.jsx
- ✅ Integrate Application Insights with loggerService
- ✅ Update ErrorBoundary to send errors to Application Insights

#### Monitoring Best Practices:
- Configure log retention: 30-90 days (free tier: 90 days)
- Review Performance tab for slow API endpoints
- Check Failures tab daily for exceptions
- Use Live Metrics for real-time monitoring during deployments
- Monitor log volume to prevent excessive logging
- Review and clean up debug logs before deployment

#### Local Development:
- Use console logging in development (Application Insights optional)
- Set connection string in `.env.development` for local testing if needed
- Application Insights gracefully handles missing connection string (no errors)
