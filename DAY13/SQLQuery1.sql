/*
select * from INFORMATION_SCHEMA.COLUMNS

SELECT 
    i.name AS IndexName,
    i.type_desc AS IndexType,
    c.name AS ColumnName,
    ic.is_included_column,
    i.is_unique,
    i.is_primary_key
FROM 
    sys.indexes i
INNER JOIN 
    sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN 
    sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE 
    i.object_id = OBJECT_ID('employees');

*/

/*CREATE INDEX idx_employee_name ON employees3(Name);*/


-- Step 1: Create the Employees4 table
CREATE TABLE Employees4 (
    EmpID INT PRIMARY KEY,                         -- Primary Key Index
    Name VARCHAR(100),
    DepartmentID INT,
    Email VARCHAR(100),
    Salary INT,
    JobTitle VARCHAR(100),
    Status VARCHAR(20)
);

-- Step 2: Insert sample data
INSERT INTO Employees4 VALUES 
(1, 'Alice', 101, 'alice@example.com', 60000, 'Manager', 'Active'),
(2, 'Bob', 102, 'bob@example.com', 55000, 'Developer', 'Inactive'),
(3, 'Charlie', 101, 'charlie@example.com', 70000, 'Developer', 'Active'),
(4, 'David', 103, 'david@example.com', 50000, 'Tester', 'Active');

--1-->
CREATE INDEX idx_employee_name ON Employees4(Name);
SELECT * FROM Employees4 WHERE Name = 'Alice';

--2-->
DROP INDEX idx_emp_dept ON Employees4;

CREATE INDEX idx_emp_dept ON Employees4(DepartmentID, Name);
SELECT * FROM Employees4 WHERE DepartmentID = 2 AND Name = 'Bob';


--3-->
CREATE UNIQUE INDEX idx_email_unique ON Employees4(Email);

--4-->
CREATE TABLE Departments4 (
    DeptID INT PRIMARY KEY,
    Name VARCHAR(100)
);


--5-->
CREATE CLUSTERED INDEX idx_salary ON Employees4(Salary);
SELECT * FROM Employees4 WHERE Salary BETWEEN 50000 AND 100000;

--6-->
CREATE NONCLUSTERED INDEX idx_jobtitle ON Employees4(JobTitle);

--7-->
CREATE FULLTEXT INDEX idx_description ON Products(Description);
SELECT * FROM Products WHERE MATCH(Description) AGAINST ('laptop');


--8-->
CREATE INDEX idx_active_employees ON Employees4(Status)
WHERE Status = 'Active';

--9-->
CREATE BITMAP INDEX idx_gender ON Employees4(Gender);


/*
-- Step 3: Create a Single-Column Index on Name
CREATE INDEX idx_employee_name ON Employees4(Name);

-- Step 4: Create a Composite Index on DepartmentID and Name
CREATE INDEX idx_emp_dept ON Employees4(DepartmentID, Name);

-- Step 5: Create a Unique Index on Email
CREATE UNIQUE INDEX idx_email_unique ON Employees4(Email);

-- Step 6: (Already created) Primary Key Index on EmpID

-- Step 7: Create a Clustered Index (only if DBMS allows manually)
-- ⚠️ Note: SQL Server allows one clustered index; here we create it on Salary
-- In MySQL InnoDB, the PRIMARY KEY is by default the clustered index.
-- Uncomment below line only in SQL Server
-- CREATE CLUSTERED INDEX idx_salary ON Employees4(Salary);

-- Step 8: Create a Non-Clustered Index on JobTitle
CREATE NONCLUSTERED INDEX idx_jobtitle ON Employees4(JobTitle);

-- Step 9: Optional – Filtered Index (SQL Server Only)
-- Uncomment if using SQL Server
-- CREATE INDEX idx_active_employees ON Employees4(Status) WHERE Status = 'Active';

*/