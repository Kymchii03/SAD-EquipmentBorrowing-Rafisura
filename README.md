# Equipment Borrowing Monitoring System

## Project Description

The Equipment Borrowing Monitoring System is a web-based system designed to manage and monitor the borrowing and returning of equipment.

The system allows authenticated users to manage equipment, record borrowing transactions, monitor returned equipment, and identify overdue equipment.

## Features

- User Login and Logout
- Dashboard
- Equipment Management
- Add Equipment
- Edit Equipment
- Delete Equipment
- Search Equipment
- Filter Equipment by Availability
- Borrow Equipment
- Record Borrowing Transactions
- Return Equipment
- Monitor Borrowed Equipment
- Monitor Returned Equipment
- Detect Overdue Equipment
- Search Transactions
- Filter Transactions by Status
- Supabase Authentication
- Supabase Database
- Row Level Security (RLS)

## Technologies Used

- HTML
- CSS
- JavaScript
- Supabase
- PostgreSQL
- GitHub
- GitHub Pages

## System Modules

### 1. Login

Users must log in using their registered email and password before accessing the system.

### 2. Dashboard

The dashboard displays an overview of the system, including:

- Total Equipment
- Available Equipment
- Borrowed Equipment
- Overdue Equipment
- Returned Equipment
- Recent Transactions

### 3. Equipment Management

Users can manage equipment records.

The system supports:

- Adding equipment
- Editing equipment
- Deleting equipment
- Viewing equipment
- Searching equipment
- Filtering equipment

Each equipment record contains:

- Equipment Name
- Category
- Asset Code
- Condition
- Availability

### 4. Borrow Equipment

Users can record a new borrowing transaction.

The borrowing form contains:

- Borrower Name
- Borrower Type
- Department
- Equipment
- Date Borrowed
- Due Date

After a successful borrowing transaction, the equipment availability changes from **Available** to **Borrowed**.

### 5. Transactions

The Transactions module allows users to monitor borrowing records.

The system displays:

- Transaction ID
- Equipment
- Borrower
- Borrower Type
- Department
- Date Borrowed
- Due Date
- Date Returned
- Status
- Return Action

### 6. Overdue Detection

If the current date is later than the due date and the equipment has not been returned, the transaction is displayed as **Overdue**.

### 7. Return Equipment

When equipment is returned, the transaction status becomes **Returned** and the equipment becomes **Available** again.

## Business Rules

### BR-01
Equipment name cannot be empty.

### BR-02
Asset code must be unique.

### BR-03
Only available equipment can be borrowed.

### BR-04
Borrower name must be provided.

### BR-05
Due date cannot be earlier than the borrowing date.

### BR-06
Newly borrowed equipment must have a status of Borrowed.

### BR-07
Borrowed equipment becomes unavailable.

### BR-08
Returned equipment becomes available.

### BR-09
If the current date is later than the due date and the transaction is not Returned, the system displays Overdue.

### BR-10
Equipment deletion requires confirmation.

### BR-11
Only authenticated users can manage records.

### BR-12
A returned transaction cannot be returned a second time.

## Database

The system uses Supabase as its database and authentication platform.

### Equipment Table

The `equipment` table contains:

| Field | Description |
|---|---|
| id | Unique equipment ID |
| equipment_name | Name of the equipment |
| category | Equipment category |
| asset_code | Unique asset code |
| condition | Current equipment condition |
| availability | Equipment availability |
| created_at | Date and time the record was created |

### Borrow Transactions Table

The `borrow_transactions` table contains:

| Field | Description |
|---|---|
| id | Unique transaction ID |
| equipment_id | ID of the borrowed equipment |
| borrower_name | Name of the borrower |
| borrower_type | Student, Faculty, or Staff |
| department | Borrower's department |
| date_borrowed | Date the equipment was borrowed |
| due_date | Date the equipment should be returned |
| date_returned | Date the equipment was returned |
| status | Borrowed or Returned |
| user_id | ID of the authenticated user |
| created_at | Date and time the transaction was created |

## Row Level Security

Row Level Security (RLS) is enabled in the Supabase database.

Only authenticated users are allowed to access and manage equipment and borrowing transaction records.

## Project Structure

```text
Equipment-Borrowing-System/
│
├── index.html
├── login.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── supabase.js
│   ├── auth.js
│   ├── equipment.js
│   └── transactions.js
│
├── README.md
│
└── documentation/
    ├── use-case.png
    └── erd.png

    ![alt text](<Screenshot 2026-09-09 092444.png>)
    ![alt text](<Screenshot 2026-09-09 092348.png>)