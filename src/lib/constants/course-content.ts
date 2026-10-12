export interface SlideItem {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  codeSnippet?: string;
  diagramAscii?: string;
  speakerNotes: string;
  keyTakeaway: string;
}

export interface DocumentPage {
  pageNumber: number;
  chapterTitle: string;
  content: string;
  codeBlocks?: { language: string; code: string; explanation?: string }[];
  keyHighlights: string[];
}

export interface CourseDocument {
  id: string;
  title: string;
  filename: string;
  subject: string;
  type: 'pdf' | 'docx' | 'pptx' | 'csv' | 'sql';
  size: string;
  isStudied: boolean;
  topicRef: string;
  estimatedReadTimeMins: number;
  overview: string;
  pages?: DocumentPage[];
  slides?: SlideItem[];
  csvData?: {
    columns: string[];
    rows: Record<string, string | number>[];
    sampleQueries: string[];
  };
  aiKeySummary: string[];
  practiceQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export const COURSE_DOCUMENTS: CourseDocument[] = [
  // 1. Introduction to DBMS - File System - Day1.pdf
  {
    id: 'r1',
    title: 'Introduction to DBMS - File System - Day1.pdf',
    filename: 'Introduction to DBMS - File System - Day1.pdf',
    subject: 'MySQL / DBMS',
    type: 'pdf',
    size: '2.4 MB',
    isStudied: true,
    topicRef: 'File Systems vs DBMS & Relational Architecture',
    estimatedReadTimeMins: 15,
    overview: 'Foundational architectural comparison between OS flat files and Relational DBMS. Details data redundancy, ANSI/SPARC 3-tier architecture, and transactional reliability.',
    pages: [
      {
        pageNumber: 1,
        chapterTitle: 'Drawbacks of File-Processing Systems',
        content: `### 1.1 Limitations of Operating System File Systems
In early computerized business systems, data was stored in conventional flat files processed by dedicated programming scripts (C, COBOL, Python). This architecture introduced severe systemic vulnerabilities:

1. **Data Redundancy and Inconsistency:**
   - Multiple copies of duplicate information (e.g., student addresses maintained in both billing and course enrolment files).
   - Inevitable divergence occurs when one file is updated while the other is neglected.

2. **Difficulty in Accessing Data:**
   - Conventional file systems do not possess declarative query capability.
   - Extracting a custom report (e.g., students with GPA > 8.5 in Bangalore) requires writing and compiling a brand-new custom program.

3. **Data Isolation:**
   - Data scattered across disparate binary files in proprietary formats prevents straightforward relational joins and correlations.

4. **Integrity Problems:**
   - Business constraints (e.g., account balance must never fall below ₹0) must be manually coded into each application program.
   - When business policies change, modifying code across hundreds of files is extremely error-prone.`,
        keyHighlights: [
          'Flat files lack declarative SQL interfaces, forcing procedural coding.',
          'Data redundancy inevitably causes data inconsistency.',
          'Business validation constraints cannot be centralized in plain OS files.',
        ],
      },
      {
        pageNumber: 2,
        chapterTitle: 'Concurrency, Atomicity & ANSI/SPARC 3-Level Architecture',
        content: `### 1.2 Concurrent Access Anomalies & Atomicity
- **Atomicity Anomalies:** An operation (such as funds transfer: debit Account A, credit Account B) must either complete entirely or leave data untouched. Power failure in a file system leaves inconsistent states.
- **Concurrent-Access Anomalies:** Without row/page-level locks, two concurrent scripts writing to the same customer file cause lost updates and race conditions.

### 1.3 The ANSI/SPARC 3-Tier Database Framework
To insulate application programs from underlying disk and block structures, the ANSI/SPARC framework divides databases into three discrete levels:

1. **External Level (Views):**
   - Individual user interfaces and tailored schemas (e.g., Accounts team sees only billing fields; Faculty sees only academic grades).
2. **Conceptual Level (Logical Schema):**
   - The unified community view describing all entities, attributes, relationships, and integrity constraints without storage details.
3. **Internal Level (Physical Schema):**
   - Low-level disk block storage, B+ tree clustered indices, row compression, and binary byte layouts.`,
        codeBlocks: [
          {
            language: 'sql',
            code: `-- Demonstrating ANSI/SPARC Conceptual vs External Schema
-- Conceptual: Complete Table
CREATE TABLE students (
    student_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cgpa DECIMAL(3,2),
    fee_balance INT
);

-- External Schema: Public View hiding fee balance
CREATE VIEW v_faculty_student_roster AS
SELECT student_id, name, cgpa
FROM students;`,
            explanation: 'Views provide External Schema abstraction over the Conceptual Schema.',
          },
        ],
        keyHighlights: [
          'Logical Data Independence: Capacity to modify Conceptual schema without changing External views.',
          'Physical Data Independence: Capacity to alter Physical storage without modifying Conceptual schema.',
          'ACID compliance guarantees atomicity and isolation unavailable in plain files.',
        ],
      },
    ],
    aiKeySummary: [
      'File systems suffer from data redundancy, inconsistency, isolation, and lack of declarative ad-hoc querying.',
      'ANSI/SPARC separates views (External), entity models (Conceptual), and disk storage (Internal) to provide Data Independence.',
      'RDBMS resolves concurrency anomalies and atomicity failures via transactional logging and locking.',
    ],
    practiceQuestions: [
      {
        question: 'Which level of the ANSI/SPARC architecture defines the community view of all entities and relationships?',
        options: ['Internal Level', 'Conceptual Level', 'External Level', 'Physical Level'],
        correctIndex: 1,
        explanation: 'The Conceptual (Logical) level defines all enterprise entities and relationships while hiding physical disk representations.',
      },
      {
        question: 'What is Logical Data Independence?',
        options: [
          'Ability to change hard drives without stopping the server',
          'Ability to modify the conceptual schema without altering existing external views',
          'Ability to write queries in multiple programming languages',
          'Storing files across distributed networks',
        ],
        correctIndex: 1,
        explanation: 'Logical Data Independence enables altering the conceptual schema without breaking application programs relying on external views.',
      },
    ],
  },

  // 2. Constraints in DBMS.pdf
  {
    id: 'r2',
    title: 'Constraints in DBMS.pdf',
    filename: 'Constraints in DBMS.pdf',
    subject: 'MySQL / DBMS',
    type: 'pdf',
    size: '1.8 MB',
    isStudied: true,
    topicRef: 'MySQL Data Types & Constraints',
    estimatedReadTimeMins: 12,
    overview: 'Comprehensive guide to relational integrity constraints in MySQL: Domain, Entity, Referential, and User-Defined constraints.',
    pages: [
      {
        pageNumber: 1,
        chapterTitle: 'Core Relational Constraints',
        content: `### 2.1 The 4 Pillars of Relational Integrity
Constraints enforce semantic business rules directly in the storage engine, rejecting invalid write transactions:

1. **NOT NULL:** Enforces that a column cannot store NULL values.
2. **UNIQUE:** Guarantees that all values in an attribute are distinct. NULLs are allowed unless combined with NOT NULL.
3. **PRIMARY KEY:** Combines NOT NULL and UNIQUE into a clustered index identifier for rows. A table can possess only ONE primary key.
4. **FOREIGN KEY:** Establishes a referential link to a primary or unique key in another table. Enforces referential integrity.
5. **CHECK:** Validates that values satisfy a boolean predicate expression (e.g., age >= 18).
6. **DEFAULT:** Supplies a fallback value when an INSERT omits the column.`,
        codeBlocks: [
          {
            language: 'sql',
            code: `CREATE TABLE cdac_batches (
    batch_code VARCHAR(20) PRIMARY KEY,
    course_name VARCHAR(50) NOT NULL,
    intake_capacity INT CHECK (intake_capacity BETWEEN 30 AND 120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scholars (
    scholar_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    batch_ref VARCHAR(20),
    FOREIGN KEY (batch_ref) REFERENCES cdac_batches(batch_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);`,
            explanation: 'Relational table definition demonstrating PRIMARY KEY, FOREIGN KEY with CASCADE, CHECK, UNIQUE, and DEFAULT.',
          },
        ],
        keyHighlights: [
          'A table can possess only ONE PRIMARY KEY, but MULTIPLE UNIQUE keys.',
          'ON DELETE CASCADE automatically removes dependent child rows when the parent is deleted.',
          'ON DELETE SET NULL sets foreign key references to NULL upon parent deletion.',
        ],
      },
    ],
    aiKeySummary: [
      'PRIMARY KEY guarantees row uniqueness and clustering, allowing no NULL values.',
      'FOREIGN KEY preserves referential integrity with ON DELETE / ON UPDATE cascade behaviors.',
      'CHECK constraints enforce domain-specific business rules at the database engine level.',
    ],
    practiceQuestions: [
      {
        question: 'What is the key difference between a PRIMARY KEY and a UNIQUE constraint in MySQL?',
        options: [
          'PRIMARY KEY allows NULLs; UNIQUE does not',
          'A table can have multiple UNIQUE keys, but only one PRIMARY KEY',
          'UNIQUE keys cannot be referenced by foreign keys',
          'PRIMARY KEY only works on numeric data types',
        ],
        correctIndex: 1,
        explanation: 'A table can only have one PRIMARY KEY (which enforces NOT NULL and creates a clustered index), but can have multiple UNIQUE constraints.',
      },
    ],
  },

  // 3. DCL-TCL-Subquery-Correlated-Views-Temp Tables.pptx
  {
    id: 'r5',
    title: 'DCL-TCL-Subquery-Correlated-Views-Temp Tables.pptx',
    filename: 'DCL-TCL-Subquery-Correlated-Views-Temp Tables.pptx',
    subject: 'MySQL / DBMS',
    type: 'pptx',
    size: '5.2 MB',
    isStudied: false,
    topicRef: 'Subqueries, Views & Transaction Controls',
    estimatedReadTimeMins: 20,
    overview: 'Slide deck exploring advanced MySQL operations: DCL security grants, ACID transaction boundaries, correlated subqueries, and database views.',
    slides: [
      {
        slideNumber: 1,
        title: 'Transaction Control Language (TCL) & ACID',
        subtitle: 'Maintaining Relational Consistency Across Concurrent Operations',
        bullets: [
          'Transactions bundle multiple DML statements into a single atomic execution unit.',
          'START TRANSACTION or BEGIN explicitly initializes a transaction boundary.',
          'COMMIT writes all changes permanently to the redo logs and disk.',
          'ROLLBACK undos all operations back to the transaction start or designated SAVEPOINT.',
        ],
        codeSnippet: `START TRANSACTION;
UPDATE accounts SET balance = balance - 10000 WHERE id = 101;
SAVEPOINT debit_done;
UPDATE accounts SET balance = balance + 10000 WHERE id = 202;
-- If step 2 fails:
-- ROLLBACK TO debit_done;
COMMIT;`,
        speakerNotes: 'Explain why DDL statements auto-commit in MySQL InnoDB and cannot be rolled back.',
        keyTakeaway: 'TCL ensures that financial and critical database updates satisfy the ACID Atomicity rule.',
      },
      {
        slideNumber: 2,
        title: 'Single-Row vs Multi-Row Subqueries',
        subtitle: 'Subqueries in WHERE, HAVING, and FROM Clauses',
        bullets: [
          'Single-Row Subqueries: Return exactly one value using operators =, <, >, <=, >=, !=.',
          'Multi-Row Subqueries: Return a column of values using IN, ANY, ALL.',
          'IN: Matches if the expression equals any value in the subquery result set.',
          'ALL: Condition must evaluate true against EVERY value returned by the subquery.',
          'ANY / SOME: Condition must evaluate true against AT LEAST ONE value.',
        ],
        codeSnippet: `-- Scholars with score higher than the batch average
SELECT scholar_id, name, score
FROM exam_attempts
WHERE score > (SELECT AVG(score) FROM exam_attempts);`,
        speakerNotes: 'Highlight the difference between ANY (> ANY means greater than min) and ALL (> ALL means greater than max).',
        keyTakeaway: 'Subqueries enable dynamic filtering based on aggregated statistical benchmarks.',
      },
      {
        slideNumber: 3,
        title: 'Correlated Subqueries & EXISTS Operator',
        subtitle: 'Row-by-Row Evaluated Subqueries',
        bullets: [
          'A correlated subquery references columns from the outer query table.',
          'The subquery is executed repeatedly, once for every candidate row evaluated by the outer query.',
          'EXISTS returns TRUE as soon as the inner query finds at least one matching record.',
          'NOT EXISTS is ideal for anti-join queries (finding unmatched parents).',
        ],
        codeSnippet: `-- Find employees earning above their department average
SELECT e.emp_id, e.name, e.salary, e.dept_id
FROM employees e
WHERE e.salary > (
    SELECT AVG(sub.salary)
    FROM employees sub
    WHERE sub.dept_id = e.dept_id
);`,
        speakerNotes: 'Discuss query performance optimization: correlated subqueries can be slow without proper indices on joined attributes.',
        keyTakeaway: 'Correlated subqueries evaluate per row of the outer query, enabling departmental and partitioned logic.',
      },
      {
        slideNumber: 4,
        title: 'Database Views & Temporary Tables',
        subtitle: 'Virtual Tables for Security and Complexity Encapsulation',
        bullets: [
          'Views: Saved SQL queries acting as virtual tables without storing duplicated data.',
          'Updatable Views: Views without aggregations, GROUP BY, DISTINCT, or complex joins can receive INSERT/UPDATE.',
          'WITH CHECK OPTION: Enforces that DML through the view adheres to the view WHERE criteria.',
          'Temporary Tables: Session-specific tables that automatically drop when the client connection terminates.',
        ],
        codeSnippet: `CREATE VIEW v_bda_top_performers AS
SELECT scholar_id, name, AVG(score) as avg_score
FROM quiz_attempts
GROUP BY scholar_id, name
HAVING AVG(score) >= 85;`,
        speakerNotes: 'Emphasize that temporary tables are visible only to the current session and cannot conflict across users.',
        keyTakeaway: 'Views abstract schema complexity and restrict direct column access for security.',
      },
    ],
    aiKeySummary: [
      'TCL statements (COMMIT, ROLLBACK, SAVEPOINT) preserve transaction atomicity.',
      'Correlated subqueries depend on outer query column values and execute row-by-row.',
      'Views provide logical abstractions and security layers without duplicating disk storage.',
    ],
    practiceQuestions: [
      {
        question: 'Which clause in a MySQL VIEW definition prevents inserts or updates that violate the view filter condition?',
        options: ['WITH ENCRYPTION', 'WITH CHECK OPTION', 'ENFORCE CONSTRAINT', 'RESTRICT UPDATE'],
        correctIndex: 1,
        explanation: 'WITH CHECK OPTION guarantees that any row inserted or updated via the view satisfies the WHERE clause condition.',
      },
    ],
  },

  // 4. Normalization.pptx
  {
    id: 'r8',
    title: 'Normalization.pptx',
    filename: 'Normalization.pptx',
    subject: 'MySQL / DBMS',
    type: 'pptx',
    size: '4.8 MB',
    isStudied: false,
    topicRef: 'Normalization 1NF, 2NF, 3NF & BCNF',
    estimatedReadTimeMins: 18,
    overview: 'Slide deck breaking down Relational Database Normalization: Functional Dependencies, Anomaly prevention, 1NF, 2NF, 3NF, and Boyce-Codd Normal Form.',
    slides: [
      {
        slideNumber: 1,
        title: 'Why Normalize? The Three Database Anomalies',
        subtitle: 'Eliminating Redundancy in Relational Schemas',
        bullets: [
          'Insertion Anomaly: Inability to insert an entity record without supplying unrelated attributes.',
          'Deletion Anomaly: Unintended loss of crucial information when deleting an unrelated record.',
          'Update Anomaly: Inconsistent updates caused by modifying redundant values in some rows but missing others.',
        ],
        speakerNotes: 'Present the classic example of storing student and department data in one single table.',
        keyTakeaway: 'Normalization decomposes tables to ensure every non-key attribute depends strictly on the primary key.',
      },
      {
        slideNumber: 2,
        title: 'First Normal Form (1NF) & Second Normal Form (2NF)',
        subtitle: 'Atomic Values & Eliminating Partial Dependencies',
        bullets: [
          '1NF Requirement: All attribute values must be atomic (no multi-valued lists or nested records).',
          '1NF Requirement: Every column must have a unique name; row order does not matter.',
          '2NF Requirement: Table must be in 1NF AND have NO Partial Dependency.',
          'Partial Dependency: A non-prime attribute depends on only a PART of a composite primary key.',
        ],
        codeSnippet: `-- Violates 2NF: Composite Key (StudentID, CourseID)
-- CourseTeacher depends ONLY on CourseID (Partial Dependency)
-- Solution: Decompose into:
-- 1. Student_Course (StudentID, CourseID)
-- 2. Course_Details (CourseID, CourseTeacher)`,
        speakerNotes: 'Clarify that tables with a single-attribute primary key in 1NF are automatically in 2NF.',
        keyTakeaway: '2NF removes partial dependencies where attributes depend on only part of a composite key.',
      },
      {
        slideNumber: 3,
        title: 'Third Normal Form (3NF) & BCNF',
        subtitle: 'Eliminating Transitive Dependencies',
        bullets: [
          '3NF Requirement: Table must be in 2NF AND have NO Transitive Dependency (X -> Y and Y -> Z).',
          'Rule of 3NF: For every functional dependency X -> Y, either X is a superkey OR Y is a prime attribute.',
          'BCNF (Boyce-Codd): A stricter version of 3NF. For EVERY functional dependency X -> Y, X MUST be a superkey.',
        ],
        speakerNotes: 'Quote the famous aphorism: "Every non-key attribute must provide a fact about the key, the whole key, and nothing but the key, so help me Codd."',
        keyTakeaway: '3NF removes transitive dependencies; BCNF requires determinants to be candidate keys.',
      },
    ],
    aiKeySummary: [
      'Normalization prevents Insertion, Deletion, and Update anomalies.',
      '1NF requires atomic values; 2NF eliminates partial dependencies on composite keys.',
      '3NF eliminates transitive dependencies; BCNF requires all determinants to be superkeys.',
    ],
    practiceQuestions: [
      {
        question: 'If a table is in 1NF and its primary key consists of a single column (not composite), which normal form is it automatically in?',
        options: ['1NF only', '2NF', '3NF', 'BCNF'],
        correctIndex: 1,
        explanation: 'Because a partial dependency requires a composite key, a table with a single-column primary key cannot have partial dependencies and is automatically in 2NF.',
      },
    ],
  },

  // 5. emp.csv
  {
    id: 'r13',
    title: 'emp.csv',
    filename: 'emp.csv',
    subject: 'Python / Analytics',
    type: 'csv',
    size: '48 KB',
    isStudied: true,
    topicRef: 'Pandas Data Wrangling & SQL Ingestion',
    estimatedReadTimeMins: 10,
    overview: 'Standard corporate benchmark dataset used across C-DAC PGCP-BDA for SQL querying, Pandas transformations, and aggregation benchmarks.',
    csvData: {
      columns: ['EMP_ID', 'NAME', 'DEPARTMENT', 'DESIGNATION', 'SALARY', 'EXPERIENCE_YRS', 'CITY'],
      rows: [
        { EMP_ID: 101, NAME: 'Harshal Ch.', DEPARTMENT: 'Big Data & AI', DESIGNATION: 'Lead Architect', SALARY: 145000, EXPERIENCE_YRS: 5, CITY: 'Pune' },
        { EMP_ID: 102, NAME: 'Aarav Sharma', DEPARTMENT: 'Data Engineering', DESIGNATION: 'Senior Spark Dev', SALARY: 115000, EXPERIENCE_YRS: 4, CITY: 'Bangalore' },
        { EMP_ID: 103, NAME: 'Priya Iyer', DEPARTMENT: 'Analytics', DESIGNATION: 'Data Scientist', SALARY: 125000, EXPERIENCE_YRS: 3, CITY: 'Hyderabad' },
        { EMP_ID: 104, NAME: 'Rohan Deshmukh', DEPARTMENT: 'Big Data & AI', DESIGNATION: 'ML Engineer', SALARY: 110000, EXPERIENCE_YRS: 3, CITY: 'Pune' },
        { EMP_ID: 105, NAME: 'Ananya Verma', DEPARTMENT: 'Data Engineering', DESIGNATION: 'ETL Pipeline Dev', SALARY: 95000, EXPERIENCE_YRS: 2, CITY: 'Mumbai' },
        { EMP_ID: 106, NAME: 'Vikram Joshi', DEPARTMENT: 'Analytics', DESIGNATION: 'BI Analyst', SALARY: 88000, EXPERIENCE_YRS: 2, CITY: 'Delhi' },
        { EMP_ID: 107, NAME: 'Kavita Menon', DEPARTMENT: 'Cloud Infra', DESIGNATION: 'DevOps Engineer', SALARY: 130000, EXPERIENCE_YRS: 4, CITY: 'Bangalore' },
        { EMP_ID: 108, NAME: 'Manish Gupta', DEPARTMENT: 'Big Data & AI', DESIGNATION: 'Hadoop Specialist', SALARY: 120000, EXPERIENCE_YRS: 4, CITY: 'Pune' },
      ],
      sampleQueries: [
        'SELECT DEPARTMENT, AVG(SALARY) AS avg_sal, COUNT(*) FROM emp GROUP BY DEPARTMENT;',
        'SELECT * FROM emp WHERE SALARY > 100000 AND CITY = "Pune" ORDER BY SALARY DESC;',
        'df.groupby("DEPARTMENT")["SALARY"].agg(["mean", "median", "count"])',
      ],
    },
    aiKeySummary: [
      'Empirical dataset containing 8 records across Big Data, Data Engineering, and Analytics departments.',
      'Ideal for practicing SQL GROUP BY, HAVING, and window functions (RANK, DENSE_RANK).',
      'Serves as the baseline dataset for Pandas DataFrame ingestion and aggregations.',
    ],
    practiceQuestions: [
      {
        question: 'Which Pandas operation computes the median salary grouped by department on the emp dataset?',
        options: [
          'emp.filter("DEPARTMENT").median("SALARY")',
          'emp.groupby("DEPARTMENT")["SALARY"].median()',
          'emp.aggregate_by("DEPARTMENT", "SALARY", "median")',
          'emp.pivot_table(index="SALARY", columns="DEPARTMENT")',
        ],
        correctIndex: 1,
        explanation: 'In Pandas, `df.groupby("DEPARTMENT")["SALARY"].median()` groups rows and computes median per department.',
      },
    ],
  },

  // 6. NumPy (1).pptx
  {
    id: 'r14',
    title: 'NumPy (1).pptx',
    filename: 'NumPy (1).pptx',
    subject: 'Python / Analytics',
    type: 'pptx',
    size: '5.6 MB',
    isStudied: false,
    topicRef: 'NumPy Arrays & Vectorization',
    estimatedReadTimeMins: 16,
    overview: 'Slide deck exploring NumPy ndarrays, multidimensional indexing, broadcasting rules, vectorization performance, and linear algebra operations.',
    slides: [
      {
        slideNumber: 1,
        title: 'Introduction to NumPy & ndarray Architecture',
        subtitle: 'Why NumPy Outperforms Native Python Lists by 50x',
        bullets: [
          'ndarray: Homogeneous multidimensional array stored in contiguous memory buffers.',
          'Static Typing: Fixed C data types (int32, float64) eliminate Python dynamic pointer overhead.',
          'Vectorization: Operations execute in compiled C loops without interpreter bytecode overhead.',
          'Broadcasting: Mechanism allowing arithmetic between arrays of different compatible shapes.',
        ],
        codeSnippet: `import numpy as np

# Creating 1D and 2D arrays
arr_1d = np.array([10, 20, 30, 40])
matrix = np.arange(1, 13).reshape(3, 4)

print("Shape:", matrix.shape)  # (3, 4)
print("Dtype:", matrix.dtype)  # int64`,
        speakerNotes: 'Point out that Python lists store pointers to heap objects, while ndarray stores raw unboxed C primitives in cache-friendly memory.',
        keyTakeaway: 'NumPy delivers orders-of-magnitude performance gains via contiguous C-memory layouts and vectorization.',
      },
      {
        slideNumber: 2,
        title: 'Array Slicing, Strides & Memory Views',
        subtitle: 'Zero-Copy Slicing vs Explicit Copies',
        bullets: [
          'Basic Slicing returns a VIEW, not a copy. Modifying a slice alters the original array!',
          'Syntax: arr[start:stop:step, start:stop:step] for 2D slicing.',
          'To create an independent clone in memory, explicitly invoke arr.copy().',
          'Boolean Masking: Filtering elements matching condition arr[arr > 25].',
        ],
        codeSnippet: `matrix = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

# Extract top-right 2x2 sub-matrix
sub = matrix[0:2, 1:3]

# Boolean filtering: all even numbers
evens = matrix[matrix % 2 == 0]  # array([2, 4, 6, 8])`,
        speakerNotes: 'Warn students about unintended side effects: sub[:] = 99 modifies the original matrix!',
        keyTakeaway: 'Array slices are zero-copy memory views; use .copy() when mutation isolation is required.',
      },
      {
        slideNumber: 3,
        title: 'NumPy Broadcasting Rules',
        subtitle: 'Arithmetic on Mismatched Array Dimensions',
        bullets: [
          'Rule 1: If arrays have different rank, prepend dimensions of size 1 to the smaller array.',
          'Rule 2: Arrays are compatible along a dimension if their sizes are equal OR one of them is 1.',
          'Rule 3: After broadcasting, the resulting array has the maximum size along each axis.',
        ],
        codeSnippet: `A = np.ones((3, 4))  # Shape (3, 4)
B = np.array([1, 2, 3, 4])  # Shape (4,) -> broadcasts to (3, 4)

result = A + B  # Successfully executes via broadcasting!`,
        speakerNotes: 'Draw the 2D matrix on the board and illustrate how 1D row vector B stretches vertically across all 3 rows.',
        keyTakeaway: 'Broadcasting avoids redundant in-memory copies when operating across differing dimensional scales.',
      },
    ],
    aiKeySummary: [
      'NumPy arrays are homogeneous, contiguous, and vectorize operations in compiled C.',
      'Slicing produces zero-copy memory views; boolean masking filters elements efficiently.',
      'Broadcasting extends dimensions of size 1 across larger arrays without memory overhead.',
    ],
    practiceQuestions: [
      {
        question: 'What happens to the original NumPy array when you modify elements in a standard slice (e.g. sub = arr[0:2]; sub[0] = 99)?',
        options: [
          'The original array is untouched because slices are deep copies',
          'The original array is modified because basic slices are views of the same memory buffer',
          'A runtime exception is raised for unallocated memory',
          'Only the slice is modified, and changes sync on flush',
        ],
        correctIndex: 1,
        explanation: 'Basic array slicing in NumPy returns views that reference the identical underlying memory buffer.',
      },
    ],
  },

  // 7. Pandas (1).pptx
  {
    id: 'r16',
    title: 'Pandas (1).pptx',
    filename: 'Pandas (1).pptx',
    subject: 'Python / Analytics',
    type: 'pptx',
    size: '7.1 MB',
    isStudied: false,
    topicRef: 'Series, DataFrames & Data Ingestion',
    estimatedReadTimeMins: 18,
    overview: 'Slide deck mastering Pandas Series and DataFrames: labeled indexing, CSV/Excel ingestion, handling missing values, and group aggregations.',
    slides: [
      {
        slideNumber: 1,
        title: 'Pandas Core Data Structures: Series vs DataFrame',
        subtitle: '1D Labeled Array vs 2D Tabular Structure',
        bullets: [
          'Series: 1D array with labeled index capable of holding any data type.',
          'DataFrame: 2D labeled data structure with columns of potentially different types.',
          'Aligned Indexing: Automatic alignment of data across series based on index labels during operations.',
        ],
        codeSnippet: `import pandas as pd

# Creating a DataFrame from dict
data = {
    'Student': ['Harshal', 'Aarav', 'Priya'],
    'Score': [96, 88, 92],
    'Status': ['Pass', 'Pass', 'Pass']
}
df = pd.DataFrame(data)
print(df.describe())`,
        speakerNotes: 'Emphasize that DataFrames are essentially collections of Series sharing a common index.',
        keyTakeaway: 'Pandas combines the performance of NumPy with labeled indices and heterogeneous column types.',
      },
      {
        slideNumber: 2,
        title: 'Filtering, loc vs iloc',
        subtitle: 'Label-Based vs Integer-Position Indexing',
        bullets: [
          'loc: Purely label-based indexing (inclusive of end bounds: df.loc[0:2, "Score"]).',
          'iloc: Purely integer-position based indexing (exclusive of end bounds: df.iloc[0:2, 1]).',
          'Boolean Filtering: df[(df["Score"] >= 90) & (df["Status"] == "Pass")].',
        ],
        codeSnippet: `# Selecting specific row and column
top_student = df.loc[df['Score'] > 90, ['Student', 'Score']]

# Integer slicing top 2 rows and first 2 columns
subset = df.iloc[0:2, 0:2]`,
        speakerNotes: 'Stress the difference: .loc["a":"c"] includes "c", while .iloc[0:2] stops before index 2.',
        keyTakeaway: 'Use .loc for explicit label lookups and .iloc for positional numerical coordinates.',
      },
      {
        slideNumber: 3,
        title: 'Missing Data & Aggregations (GroupBy)',
        subtitle: 'Handling NaNs and Split-Apply-Combine Pattern',
        bullets: [
          'isna() / notna(): Detect missing null values.',
          'dropna(): Drop rows or columns containing missing values.',
          'fillna(value): Impute missing values with mean, median, or constants.',
          'groupby(): Implements the Split-Apply-Combine data analytics pattern.',
        ],
        codeSnippet: `# Impute missing scores with column mean
df['Score'] = df['Score'].fillna(df['Score'].mean())

# GroupBy Department and calculate multi-metric summary
summary = df.groupby('Department').agg({
    'Score': ['mean', 'max'],
    'Student': 'count'
})`,
        speakerNotes: 'Highlight the danger of dropping data prematurely versus domain-appropriate imputation.',
        keyTakeaway: 'GroupBy powers the split-apply-combine workflow for grouped analytical reporting.',
      },
    ],
    aiKeySummary: [
      'Series are 1D labeled arrays; DataFrames are 2D tabular structures with heterogeneous columns.',
      'Use .loc for label-based lookups and .iloc for zero-indexed positional slicing.',
      'GroupBy implements the split-apply-combine workflow for grouped metrics and summaries.',
    ],
    practiceQuestions: [
      {
        question: 'Which method in Pandas selects rows using integer position coordinates rather than label names?',
        options: ['.loc', '.iloc', '.at', '.ix'],
        correctIndex: 1,
        explanation: '`.iloc` is strictly integer-position based, whereas `.loc` is label-based.',
      },
    ],
  },
];
