# 🗄️ Database Setup Guide

## Problem: Table 'railway.users' doesn't exist

This means your MySQL database has no tables yet. Follow these steps to create all tables.

---

## 📋 Your Database Schema

Your project uses **Drizzle ORM** with the following tables:

### Core Tables:
- `users` - User authentication (with Clerk integration)
- `tenants` - Multi-tenant organizations
- `memberships` - User-Tenant relationships

### CRM Tables:
- `leads` - CRM Leads
- `contacts` - CRM Contacts
- `deals` - CRM Deals
- `pipeline_stages` - Deal pipeline stages
- `tasks` - Tasks and to-dos
- `notes` - Notes attached to deals

### Document Management:
- `files` - File uploads
- `contracts` - Contract templates
- `contract_assignments` - Contract assignments to users
- `contract_acceptances` - Contract acceptance tracking

### E-Commerce:
- `orders` - Stripe purchases
- `invoices` - Invoices
- `invoice_items` - Invoice line items
- `invoice_counters` - Invoice number generation

### Onboarding:
- `onboarding_data` - User onboarding questionnaire data
- `onboarding_documents` - Uploaded onboarding documents
- `questionnaires` - Custom questionnaires
- `questionnaire_responses` - Questionnaire responses

### System:
- `audit_logs` - Audit trail
- `download_stats` - Download statistics

---

## 🚀 Quick Setup (Recommended)

### **Step 1: Ensure DATABASE_URL is set**

Check your `.env` file or Railway environment variables:

```bash
DATABASE_URL=mysql://user:password@host:port/database_name
```

**For Railway MySQL:**
```bash
DATABASE_URL=mysql://root:****@containers-us-west-xxx.railway.app:xxxx/railway
```

### **Step 2: Create all tables**

Run this single command:

```bash
npm run db:create
```

This will:
1. ✅ Connect to your MySQL database
2. ✅ Generate SQL from your Drizzle schema
3. ✅ Create all tables, enums, and indexes
4. ✅ Show you what was created

**Expected output:**
```
📡 Introspecting database...
✓ Found 0 tables
📋 Generating schema changes...
✓ Will create 26 tables
🔧 Pushing changes to database...
✓ Successfully created all tables!
```

---

## 🔍 Alternative: Step-by-Step

If you want more control, use these commands:

### **Option 1: Direct Push (Fastest)**
```bash
npx drizzle-kit push
```
- Directly pushes schema to database
- No migration files generated
- Best for initial setup

### **Option 2: Generate Migrations First**
```bash
# Generate SQL migration files
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate
```
- Creates SQL files in `drizzle/migrations/`
- More control over what gets executed
- Better for production environments

### **Option 3: Use the setup script**
```bash
npm run db:setup
```
- Checks your connection
- Shows what will be created
- Provides instructions

---

## ✅ Verify Tables Were Created

### **Method 1: MySQL Command Line**
```bash
mysql -h host -u user -p database_name
```

```sql
-- List all tables
SHOW TABLES;

-- Check users table structure
DESCRIBE users;

-- Check if tables are empty
SELECT COUNT(*) FROM users;
```

### **Method 2: In your application**

After creating tables, start your app:
```bash
npm run dev
```

Try logging in at `/sign-in` - Clerk will automatically create a user in the `users` table!

---

## 🚂 For Railway Production

### **Automatic Setup on Deploy:**

Add this to your Railway environment or run manually:

```bash
# Set in Railway dashboard as build command:
npm run build && npm run db:create
```

### **Manual Setup:**

1. **Get Railway DATABASE_URL:**
   ```bash
   # From Railway dashboard, copy the DATABASE_URL
   ```

2. **Run locally against Railway DB:**
   ```bash
   DATABASE_URL="mysql://root:...@railway" npm run db:create
   ```

---

## ❌ Troubleshooting

### **Error: "Cannot connect to database"**
✅ Check your `DATABASE_URL` is correct
✅ Ensure MySQL server is running
✅ Check firewall rules allow connection

### **Error: "drizzle-kit not found"**
```bash
npm install -D drizzle-kit
```

### **Error: "Access denied for user"**
✅ Check username and password in DATABASE_URL
✅ Ensure user has CREATE TABLE permissions

### **Error: "Unknown database 'railway'"**
✅ Database name might be wrong
✅ Create database first:
```sql
CREATE DATABASE railway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### **Want to start fresh?**
⚠️ **WARNING: This deletes all data!**

```bash
# Drop all tables
npx drizzle-kit drop

# Recreate from scratch
npm run db:create
```

---

## 📊 What Happens After Tables Are Created?

1. **First Clerk Login:**
   - User signs in via `/sign-in`
   - Clerk creates session
   - Backend creates user in `users` table
   - User gets role: `client` (default)

2. **Dashboard Access:**
   - User is authenticated
   - Can access protected routes
   - Data is saved to your MySQL database

3. **Ready to Use:**
   - All CRM features work
   - File uploads work
   - Invoices can be generated
   - Onboarding flows work

---

## 🎯 Summary

**For a fresh database, run:**

```bash
npm run db:create
```

**That's it!** All 26 tables will be created and your app will work. 🚀

---

## 📚 Additional Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview)
- Schema file: `drizzle/schema.ts`
- Config file: `drizzle.config.ts`
