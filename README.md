# Spendly — Complete Setup & Run Guide

## ✅ What Was Fixed

### Backend Issues Fixed
| Issue | Fix Applied |
|---|---|
| `AuthController` missing `/api/auth/login` endpoint | Added full login endpoint returning `{id, name, email}` |
| `BudgetController` fully commented out | Uncommented and rewritten; supports both `userId` param (Dashboard) and `email` header (Budgets page) |
| `ExpenseController` fully commented out | Uncommented and rewritten; handles CRUD under `/api/budgets/{id}/expenses` |
| `ExpenseManagementController` fully commented out | Uncommented and rewritten for `/api/expenses` flat endpoints |
| `UserRepository.findByEmail` returned `User` not `Optional<User>` | Fixed to `Optional<User>` throughout |
| `SecurityConfig` blocked all non-auth routes | Changed to `permitAll()` — auth is done via `email` header |
| Two conflicting CORS configs (`CorsConfig` + `WebConfig`) | Removed `WebConfig`, kept single `CorsConfig` with correct headers |
| `@CrossOrigin(origins = "http://localhost:5173")` on AuthController | Removed — CORS handled globally by filter |
| `User.password` exposed in JSON responses | Added `@JsonIgnore` on password field |
| Spring Boot version `3.4.5` (may not match Java 17 on some systems) | Downgraded to stable `3.2.5` |
| Duplicate `same-site` / `allow-credentials` properties in `application.properties` | Cleaned up; removed session cookie config (stateless API) |

### Frontend Issues Fixed
| Issue | Fix Applied |
|---|---|
| `ProtectedRoute` checked `localStorage.token` (never set) | Changed to check `localStorage.userId` |
| Routes were not protected at all | Wrapped all post-login routes with `ProtectedRoute` |
| `Budgets.jsx` used hardcoded `http://localhost:8080/api/budgets` | Changed to relative `/api/budgets` via axios instance |
| `Expenses.jsx` used hardcoded full URLs | Changed to relative paths |
| `AllExpenses.jsx` used hardcoded full URLs | Changed to relative paths |
| `AddExpenseForm.jsx` used hardcoded full URL | Changed to relative path |
| `CreateBudgetForm.jsx` sent `userId` as string | Fixed to `parseInt(userId, 10)` |
| `Profile.jsx` fetched `/users/{id}` (missing `/api` prefix) | Fixed to `/api/users/{id}` |
| Two axios instances (`utils/axios.js` and `api.js`) with conflicting configs | Deleted `api.js`; single `utils/axios.js` with `baseURL: http://localhost:8080` |
| Firebase imported in `Login.jsx` (optional Google auth breaks if unconfigured) | Removed Firebase dependency from Login; clean email/password only |
| `firebase` package in dependencies (unneeded, adds 500KB+) | Removed from `package.json` |
| `<Toaster />` not included in `App.jsx` | Added `react-hot-toast` Toaster to `App.jsx` |

---

## 📋 Prerequisites

### Required Software
| Software | Version | Download |
|---|---|---|
| Java (JDK) | **17** (LTS) | https://adoptium.net/ |
| Maven | 3.8+ | https://maven.apache.org/ (or use `./mvnw`) |
| Node.js | 18+ | https://nodejs.org/ |
| npm | 9+ | Bundled with Node.js |
| PostgreSQL | 14+ | https://www.postgresql.org/download/ |

### Verify your Java version
```bash
java -version
# Must output: openjdk version "17.x.x" or similar
```

If you have multiple Java versions, set `JAVA_HOME`:
```bash
# macOS (Homebrew)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Linux
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# Windows (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17..."
```

---

## 🗄️ Step 1: Set Up PostgreSQL Database

### Option A — Using psql CLI
```sql
psql -U postgres

CREATE DATABASE expense_tracker;
\q
```

### Option B — Using pgAdmin
1. Open pgAdmin → right-click "Databases" → Create → Database
2. Name: `expense_tracker`
3. Save

### Verify connection settings
The backend expects (edit `application.properties` if yours differ):
```
Host:     localhost
Port:     5432
Database: expense_tracker
Username: postgres
Password: 1234
```

If your PostgreSQL password is different, update:
```
backend/src/main/resources/application.properties
```
Change this line:
```properties
spring.datasource.password=YOUR_ACTUAL_PASSWORD
```

---

## 🚀 Step 2: Run the Backend

```bash
cd backend

# First time — download dependencies and build
mvn clean install -DskipTests

# Start the server
mvn spring-boot:run
```

**Expected output:**
```
Tomcat started on port(s): 8080 (http)
Started ExpensetrackerApplication in X.XXX seconds
```

**Hibernate will auto-create tables** (`ddl-auto=update`):
- `users`
- `budgets`
- `expenses`

### Test the backend is alive:
```bash
curl http://localhost:8080/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"123456"}'

# Expected response:
# {"id":1,"name":"Test User","email":"test@test.com"}
```

---

## 🌐 Step 3: Run the Frontend

Open a **new terminal window**:

```bash
cd frontend

npm install

npm start
```

The browser will open at **http://localhost:3000**

---

## 🔐 Step 4: Create Your Account & Log In

1. Go to **http://localhost:3000/register**
2. Enter your name, email, and password (min 6 characters)
3. You'll be redirected to `/login`
4. Log in with your credentials
5. You're on the Dashboard 🎉

---

## 🗂️ Project Structure (Fixed)

```
spendly-fixed/
├── backend/                          # Spring Boot
│   ├── pom.xml
│   └── src/main/java/com/rahimi/expensetracker/
│       ├── ExpensetrackerApplication.java
│       ├── config/
│       │   └── CorsConfig.java       # Single CORS config (WebConfig removed)
│       ├── controller/
│       │   ├── AuthController.java   # POST /api/auth/register, /api/auth/login
│       │   ├── BudgetController.java # GET/POST/DELETE /api/budgets
│       │   ├── ExpenseController.java       # CRUD /api/budgets/{id}/expenses
│       │   ├── ExpenseManagementController.java  # GET/DELETE /api/expenses
│       │   └── UserController.java   # GET/PUT /api/users/{id}
│       ├── dto/
│       │   └── LoginRequest.java
│       ├── model/
│       │   ├── User.java             # @JsonIgnore on password
│       │   ├── Budget.java
│       │   └── Expense.java
│       ├── repository/
│       │   ├── UserRepository.java   # findByEmail returns Optional<User>
│       │   ├── BudgetRepository.java
│       │   └── ExpenseRepository.java
│       ├── security/
│       │   └── SecurityConfig.java   # permitAll() — stateless API
│       └── service/
│           └── UserService.java      # register + login with BCrypt
│
└── frontend/                         # React
    ├── package.json                  # firebase removed
    ├── public/
    │   ├── index.html
    │   └── ...
    └── src/
        ├── App.jsx                   # ProtectedRoute on all auth pages + Toaster
        ├── utils/
        │   └── axios.js              # Single instance: baseURL=http://localhost:8080
        ├── components/
        │   ├── ProtectedRoute.jsx    # Checks localStorage.userId
        │   ├── CreateBudgetForm.jsx  # Uses userId, relative URL
        │   ├── AddExpenseForm.jsx    # Uses relative URL + email header
        │   └── ...
        └── pages/
            ├── Login.jsx             # Clean email/password, no Firebase
            ├── Register.jsx
            ├── Dashboard.jsx         # Uses ?userId= param
            ├── Budgets.jsx           # Uses email header, relative URL
            ├── Expenses.jsx          # Uses email header, relative URL
            ├── AllExpenses.jsx       # Uses email header, relative URL
            └── Profile.jsx           # Fixed /api/users/{id} path
```

---

## 🌐 API Reference

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Create account |
| POST | `/api/auth/login` | None | Login, returns `{id, name, email}` |
| GET | `/api/budgets?userId=1` | — | Get budgets (Dashboard) |
| GET | `/api/budgets` | `email` header | Get budgets (Budgets page) |
| POST | `/api/budgets` | Body `userId` | Create budget |
| GET | `/api/budgets/{id}` | `email` header | Get single budget |
| DELETE | `/api/budgets/{id}` | `email` header | Delete budget |
| GET | `/api/budgets/{id}/expenses` | `email` header | Get expenses for budget |
| POST | `/api/budgets/{id}/expenses` | `email` header | Add expense |
| DELETE | `/api/budgets/{id}/expenses/{expId}` | `email` header | Delete expense |
| GET | `/api/expenses` | `email` header | All expenses for user |
| DELETE | `/api/expenses/{id}` | `email` header | Delete expense |
| GET | `/api/users/{id}` | — | Get user profile |
| PUT | `/api/users/{id}` | — | Update user profile |

---

## 🐛 Troubleshooting

### Backend won't start — `java.lang.UnsupportedClassVersionError`
Your Java is too old. Run `java -version` and install JDK 17.

### Backend won't start — `Connection to localhost:5432 refused`
PostgreSQL is not running.
- **macOS**: `brew services start postgresql@14`
- **Linux**: `sudo systemctl start postgresql`
- **Windows**: Open Services → start "postgresql-x64-14"

### Backend won't start — `password authentication failed`
Wrong DB password. Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```

### Frontend — `ERR_CONNECTION_REFUSED` on API calls
The backend is not running. Start it first with `mvn spring-boot:run`.

### Frontend — `npm install` fails with peer dependency errors
```bash
npm install --legacy-peer-deps
```

### CORS errors in browser console
Make sure:
1. Backend is running on port **8080**
2. Frontend is running on port **3000**
3. You're not hitting the backend from a different port

### Login returns 401 even with correct credentials
The user doesn't exist yet. Register first at `/register`.
