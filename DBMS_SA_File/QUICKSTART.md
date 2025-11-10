# 🚀 Quick Start Guide

## Step 1: Install MySQL and Create Database

1. Make sure MySQL is installed and running
2. Open MySQL Command Line or Workbench
3. Run the schema file:
   ```sql
   source C:/Users/harsh/Desktop/DBMS_PROJECT/backend/db/schema.sql
   ```

## Step 2: Configure Database Connection

1. Open `backend\.env` file
2. Update your MySQL password:
   ```
   DB_PASSWORD=your_mysql_password
   ```

## Step 3: Install Dependencies

Open PowerShell in the backend folder:

```powershell
cd backend
npm install
```

## Step 4: Start the Server

```powershell
npm start
```

## Step 5: Open the Application

Open your browser and go to:

```
http://localhost:3000
```

## 🎉 You're Ready!

You should now see the IIT Jammu Student Affairs System dashboard.

## Test the System

1. Click on "Departments" tab
2. Click "+ Add Department"
3. Add a test department
4. Go to "Students" tab
5. Add a test student

## Need Help?

Check the full README.md for:

- Detailed setup instructions
- API documentation
- Troubleshooting guide
- Feature explanations
