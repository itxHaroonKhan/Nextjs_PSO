# Development Log & Bug Fixes Report

This document summarizes the recent issues found during the implementation of the **Create User with Permissions** feature and the technical solutions applied.

---

## 1. Database Compatibility (500 Internal Server Error)

### **The Mistake:**
I initially used the following SQL query to add the permissions column:
`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT`

### **The Issue:**
The `IF NOT EXISTS` syntax for columns is only supported in **MySQL 8.0.16+**. If your server is running an older version of MySQL or MariaDB, this query crashes the backend, resulting in a **500 Error**.

### **The Fix:**
I replaced it with a more compatible logic that first checks if the column exists using `SHOW COLUMNS` and then only runs the `ALTER` command if necessary.

---

## 2. API Request Validation (400 Bad Request)

### **The Mistake:**
The frontend was sending requests without strictly validating the state of the inputs at the moment of submission, and the backend was occasionally receiving empty fields due to state-sync delays.

### **The Issue:**
If Name, Email, or Password were missing or "undefined" during the transaction, the backend would return a **400 Bad Request**.

### **The Fix:**
- Added **explicit client-side validation** inside the `handleCreateUser` function to stop the request before it even leaves the browser if fields are empty.
- Added detailed error logging in the backend to capture exact validation failures.

---

## 3. Browser Auto-fill Conflict

### **The Mistake:**
Standard input IDs like `user-email` and `user-password` often trigger the browser's "Saved Password" manager.

### **The Issue:**
Browsers sometimes auto-fill these fields with *your* login credentials instead of letting you create a *new* user, causing confusion or submission of wrong data.

### **The Fix:**
- Changed input IDs and Names to unique strings (e.g., `new-user-email`).
- Applied `autoComplete="new-password"` to all sensitive fields to force the browser to treat them as empty new entries.

---

## 4. Redundant Database Connector Logic

### **The Mistake:**
The `Backend/db.js` was already exporting a **Promise-based Pool**, but I was occasionally trying to call `.promise()` on it again.

### **The Issue:**
In some versions of the `mysql2` library, calling `.promise().promise()` can cause a crash or return an "undefined" reference, leading to a server-side crash.

### **The Fix:**
Cleaned up the code to use the `db.query()` directly, ensuring stable and fast database operations.

---

### **Status:** ✅ Fixed & Verified
All user creation tasks, role assignments, and page-level permissions are now fully functional and compatible.
