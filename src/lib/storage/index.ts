import {
  UserProfile,
  UserSettings,
  Subject,
  Module,
  Topic,
  StudyDay,
  DailyTask,
  PracticalSubmission,
  Quiz,
  QuizAttempt,
  QuizResponse,
  FinalExam,
  FinalExamAttempt,
  RevisionItem,
  AppNotification,
  PreloadedSubjectData,
} from '@/types';
import { INITIAL_CURRICULUM } from '../constants/initial-curriculum';

// Storage version identifier for automatic migration & fresh Day 1 initialization
export const CURRENT_DATA_VERSION = 'v2_day1_150_clean';

// Default User Profile for Harshal - 150 Days Target Sprint (Clean Day 1 Start)
export const DEFAULT_USER: UserProfile = {
  id: 'usr-student-01',
  fullName: 'Harshal',
  email: 'harshal.studyos@cdac.in',
  targetExamDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 150 days target (4 months technical + 1 month placement)
  dailyTimeBudget: 120, // 120 minutes (50m theory + 60m practical + 10m recall)
  currentStreak: 0, // Starts fresh at 0 until user passes Day 1
  longestStreak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  avatarUrl: '',
};

// Default User Settings
export const DEFAULT_SETTINGS: UserSettings = {
  userId: 'usr-student-01',
  darkMode: true,
  notificationInApp: true,
  notificationBrowser: false,
  passThreshold: 80,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  userTimezone: 'Asia/Kolkata',
  subjectRotationStrategy: 'balanced_daily',
};

// Helper to build 150-Day structured study days
function generateSeedStudyDays(): StudyDay[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const days: StudyDay[] = [];

  // DAY 1 (TODAY) - Live Active Study Day
  days.push({
    id: 'day-01',
    planId: 'plan-main',
    userId: 'usr-student-01',
    dayNumber: 1,
    scheduledDate: todayStr,
    subjectId: 'sub-mysql',
    subjectTitle: 'MySQL / DBMS',
    topicTitle: 'File Systems vs DBMS & Relational Architecture',
    status: 'not_started',
    theoryStatus: 'pending',
    practicalStatus: 'pending',
    tasks: [
      {
        id: 'task-01-theory',
        studyDayId: 'day-01',
        topicId: 'top-sql-1',
        taskType: 'theory',
        timeAllocatedMins: 50,
        completed: false,
        content: {
          title: 'Deep Dive: File Systems vs DBMS & Relational Architecture',
          summary: 'Understand the architectural limitations of operating system file storage, the ANSI/SPARC 3-tier database architecture, and relational foundation principles.',
          learningObjectives: [
            'Analyze file-processing drawbacks: data redundancy, inconsistency, difficulty in accessing data, data isolation, and concurrent-access anomalies',
            'Master ANSI/SPARC 3-tier architecture: External (User views), Conceptual (Logical schema), and Internal (Physical storage) schemas',
            'Distinguish Physical vs Logical Data Independence',
            'Classify SQL statement categories: DDL (Data Definition), DML (Data Manipulation), DQL (Data Query), DCL (Data Control), and TCL (Transaction Control)',
          ],
          notes: `### 1. The Critical Failure Points of File Processing Systems
- **Data Redundancy & Inconsistency**: The same customer details stored across billing and shipping flat files lead to divergence when one file updates and another fails.
- **Difficulty in Accessing Data**: Ad-hoc queries require writing new compiled programs (C/Python scripts) rather than declarative SQL expressions.
- **Data Isolation**: Files stored in different proprietary binary formats make cross-file correlations computationally painful.
- **Integrity Problems**: Constraints (e.g., account balance >= 0) must be hardcoded into application code. When business rules change, all programs must be recompiled.
- **Atomicity Anomalies**: Power outages during file writes result in partially updated, corrupted state.
- **Concurrent Access Anomalies**: Without coordinated row/page locking, two users writing simultaneously cause lost updates or race conditions.

### 2. ANSI/SPARC 3-Level Database Architecture
- **External Level (Views)**: Tailored subsets of data visible to individual applications or user roles (e.g., hiding salaries from HR interns).
- **Conceptual Level (Logical)**: The unified logical structure of the entire enterprise database, defining all entities, attributes, relationships, and integrity rules (ER model).
- **Internal Level (Physical)**: Low-level storage representations: B+ trees, clustered indexes, block allocations, and compression.

### 3. Data Independence
- **Logical Data Independence**: The capacity to modify the conceptual schema (adding columns or tables) without altering existing external views or user programs.
- **Physical Data Independence**: The capacity to alter physical storage structures (switching SSD block sizes or rebuilding indexes) without altering the conceptual schema.

### 4. Classification of SQL Commands
- **DDL (Data Definition Language)**: CREATE, ALTER, DROP, TRUNCATE, RENAME (Modifies schema; auto-commits in MySQL).
- **DML (Data Manipulation Language)**: INSERT, UPDATE, DELETE (Modifies data rows; transactional).
- **DQL (Data Query Language)**: SELECT (Retrieves data).
- **DCL (Data Control Language)**: GRANT, REVOKE (Permissions).
- **TCL (Transaction Control Language)**: COMMIT, ROLLBACK, SAVEPOINT (Transaction management).`,
          definitions: [
            { term: 'Logical Data Independence', explanation: 'The ability to modify the conceptual schema without having to alter existing external schemas or rewrite application programs.' },
            { term: 'Physical Data Independence', explanation: 'The ability to modify internal storage structures (e.g., indexes, disk layout) without affecting conceptual or external views.' },
            { term: 'ANSI/SPARC Architecture', explanation: 'The three-level database abstraction framework consisting of External, Conceptual, and Internal levels.' },
            { term: 'Data Redundancy', explanation: 'The duplication of the same piece of information in multiple storage locations, leading to higher storage costs and update anomalies.' },
          ],
          examples: [
            'DDL: CREATE TABLE departments (id INT PRIMARY KEY, name VARCHAR(50) NOT NULL);',
            'DML: INSERT INTO departments (id, name) VALUES (1, "Big Data Analytics");',
            'DQL: SELECT * FROM departments WHERE name LIKE "%Analytics%";',
            'TCL: START TRANSACTION; INSERT INTO departments VALUES (2, "AI Labs"); COMMIT;',
          ],
          recallPrompts: [
            'Why does TRUNCATE execute orders of magnitude faster than DELETE in MySQL InnoDB?',
            'Explain how the conceptual level decouples application programs from physical disk block allocations.',
            'What specific ACID property prevents concurrent updates from overwriting each other?',
          ],
        },
      },
      {
        id: 'task-01-practical',
        studyDayId: 'day-01',
        topicId: 'top-sql-1',
        taskType: 'practical',
        timeAllocatedMins: 60,
        completed: false,
        content: {
          title: 'Practical Lab: Database Initialization & Relational Schema Modeling',
          problemStatement: 'Connect to MySQL, initialize the database environment, explore system catalogs via INFORMATION_SCHEMA, and create the foundational schema for a Big Data Analytics organization.',
          requirements: [
            'Create a new database named `cdac_bda_system` and set it as active.',
            'Create table `bda_curriculum` with `module_id INT AUTO_INCREMENT PRIMARY KEY`, `module_code VARCHAR(20) NOT NULL UNIQUE`, `title VARCHAR(100) NOT NULL`, and `credits INT NOT NULL CHECK (credits >= 1 AND credits <= 10)`.',
            'Insert 3 foundational modules: MySQL/DBMS, Python for Analytics, and Distributed Big Data.',
            'Write a query inspecting metadata from `INFORMATION_SCHEMA.COLUMNS` to verify types and constraints.',
          ],
          starterCode: `-- Day 1 Practical Lab: C-DAC BDA Schema Initialization
-- 1. Create and select the database

-- 2. Create the bda_curriculum table with constraints

-- 3. Insert initial module records

-- 4. Verify table structure from metadata
`,
          hints: [
            'Hint 1: Use `CREATE DATABASE IF NOT EXISTS cdac_bda_system;` followed by `USE cdac_bda_system;`.',
            'Hint 2: In MySQL 8.0+, CHECK constraints are enforced: `CONSTRAINT chk_credits CHECK (credits >= 1 AND credits <= 10)`.',
            'Hint 3: Query `SELECT table_name, column_name, data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = "cdac_bda_system";`.',
          ],
          solutionSnippet: `CREATE DATABASE IF NOT EXISTS cdac_bda_system;
USE cdac_bda_system;

CREATE TABLE bda_curriculum (
  module_id INT AUTO_INCREMENT PRIMARY KEY,
  module_code VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(100) NOT NULL,
  credits INT NOT NULL,
  CONSTRAINT chk_credits CHECK (credits >= 1 AND credits <= 10)
);

INSERT INTO bda_curriculum (module_code, title, credits) VALUES
  ('BDA-01', 'MySQL / Relational DBMS', 4),
  ('BDA-02', 'Python for Big Data Analytics', 5),
  ('BDA-03', 'Distributed Systems & Hadoop', 6);

SELECT table_name, column_name, data_type, column_key, is_nullable
FROM INFORMATION_SCHEMA.COLUMNS
WHERE table_schema = 'cdac_bda_system' AND table_name = 'bda_curriculum';`,
          solutionExplanation: 'This lab initializes the relational workspace, builds the first table with explicit integrity constraints (PRIMARY KEY, UNIQUE, and CHECK), and confirms proper catalog population in INFORMATION_SCHEMA.',
        },
      },
      {
        id: 'task-01-revision',
        studyDayId: 'day-01',
        topicId: 'top-sql-1',
        taskType: 'revision',
        timeAllocatedMins: 10,
        completed: false,
        content: {
          title: 'Daily Recall & Spaced Repetition',
          learningObjectives: ['Active recall of file processing vs DBMS trade-offs and 3-schema architecture'],
          recallPrompts: [
            'Recall: Why can raw file systems lead to data inconsistency during concurrent read/write operations?',
            'Recall: What is the difference between physical data independence and logical data independence?',
            'Recall: Why is TRUNCATE classified as DDL while DELETE is DML?',
          ],
        },
      },
    ],
    quiz: {
      id: 'quiz-day-01',
      studyDayId: 'day-01',
      subjectId: 'sub-mysql',
      topicId: 'top-sql-1',
      title: 'Day 1 Assessment: File Systems vs DBMS & Relational Architecture',
      passThreshold: 80,
      version: 1,
      questions: [
        {
          id: 'q1',
          quizId: 'quiz-day-01',
          questionText: 'Which layer of the ANSI/SPARC 3-tier database architecture is concerned with how data is physically stored on disk (indexes, block allocation)?',
          questionType: 'single_mcq',
          options: [
            { id: 'opt1', text: 'External Schema / View Level' },
            { id: 'opt2', text: 'Conceptual Schema / Logical Level' },
            { id: 'opt3', text: 'Internal Schema / Physical Level' },
            { id: 'opt4', text: 'Network Schema Level' },
          ],
          correctAnswer: 'opt3',
          explanation: 'The Internal Level (Physical Schema) defines low-level physical storage details, record layouts, and indexing structures like B+ trees.',
          difficulty: 'easy',
          marks: 1,
        },
        {
          id: 'q2',
          quizId: 'quiz-day-01',
          questionText: 'What is the primary definition of "Logical Data Independence"?',
          questionType: 'single_mcq',
          options: [
            { id: 'opt1', text: 'The ability to change physical SSD blocks without affecting logical queries.' },
            { id: 'opt2', text: 'The ability to modify the conceptual schema without altering existing external views or user programs.' },
            { id: 'opt3', text: 'The ability to run SQL queries without having an internet connection.' },
            { id: 'opt4', text: 'The ability to store tables in independent CSV files.' },
          ],
          correctAnswer: 'opt2',
          explanation: 'Logical Data Independence ensures that modifications to the conceptual schema (adding columns, tables) do not require rewriting existing external views or user applications.',
          difficulty: 'medium',
          marks: 1,
        },
        {
          id: 'q3',
          quizId: 'quiz-day-01',
          questionText: 'Under which category of SQL commands does `TRUNCATE TABLE` fall in MySQL?',
          questionType: 'single_mcq',
          options: [
            { id: 'opt1', text: 'DML (Data Manipulation Language)' },
            { id: 'opt2', text: 'DDL (Data Definition Language)' },
            { id: 'opt3', text: 'DCL (Data Control Language)' },
            { id: 'opt4', text: 'TCL (Transaction Control Language)' },
          ],
          correctAnswer: 'opt2',
          explanation: 'TRUNCATE TABLE is a DDL command because it drops and recreates the underlying table structure/pages, resetting AUTO_INCREMENT counters and bypassing row-by-row transaction logs.',
          difficulty: 'easy',
          marks: 1,
        },
        {
          id: 'q4',
          quizId: 'quiz-day-01',
          questionText: 'Why can traditional file-processing systems lead to "Data Inconsistency"?',
          questionType: 'single_mcq',
          options: [
            { id: 'opt1', text: 'Because files can only store numbers, not strings.' },
            { id: 'opt2', text: 'Because duplicate copies of the same data across multiple files may not be updated simultaneously.' },
            { id: 'opt3', text: 'Because files are stored in random-access memory.' },
            { id: 'opt4', text: 'Because file systems automatically delete older records.' },
          ],
          correctAnswer: 'opt2',
          explanation: 'Due to data redundancy in file systems, when data changes, some files are updated while others are missed, causing divergent (inconsistent) values.',
          difficulty: 'easy',
          marks: 1,
        },
        {
          id: 'q5',
          quizId: 'quiz-day-01',
          questionText: 'Which system catalog in MySQL allows you to query table structures, constraints, and column data types via standard SQL?',
          questionType: 'single_mcq',
          options: [
            { id: 'opt1', text: 'MYSQL_ROOT_CONFIG' },
            { id: 'opt2', text: 'INFORMATION_SCHEMA' },
            { id: 'opt3', text: 'SYSTEM_REGISTRY' },
            { id: 'opt4', text: 'INNODB_FLAT_INDEX' },
          ],
          correctAnswer: 'opt2',
          explanation: 'INFORMATION_SCHEMA provides read-only view tables exposing metadata about all databases, tables, columns, indexes, and constraints.',
          difficulty: 'medium',
          marks: 1,
        },
        {
          id: 'q6',
          quizId: 'quiz-day-01',
          questionText: 'Which SQL statement category do `GRANT` and `REVOKE` belong to?',
          questionType: 'single_mcq',
          options: [
            { id: 'opt1', text: 'DDL' },
            { id: 'opt2', text: 'DML' },
            { id: 'opt3', text: 'DCL (Data Control Language)' },
            { id: 'opt4', text: 'DQL' },
          ],
          correctAnswer: 'opt3',
          explanation: 'DCL commands manage user privileges and security permissions on database objects.',
          difficulty: 'easy',
          marks: 1,
        },
        {
          id: 'q7',
          quizId: 'quiz-day-01',
          questionText: 'What is the role of the Conceptual Schema in the ANSI/SPARC architecture?',
          questionType: 'single_mcq',
          options: [
            { id: 'opt1', text: 'It defines individual user screen layouts.' },
            { id: 'opt2', text: 'It represents the total community view of the entire database, hiding physical storage details.' },
            { id: 'opt3', text: 'It dictates the RPM speed of the hard drive.' },
            { id: 'opt4', text: 'It stores operating system kernel logs.' },
          ],
          correctAnswer: 'opt2',
          explanation: 'The Conceptual Schema defines all entities, relationships, attributes, and constraints across the enterprise without exposing physical storage implementation.',
          difficulty: 'medium',
          marks: 1,
        },
        {
          id: 'q8',
          quizId: 'quiz-day-01',
          questionText: 'True or False: In standard MySQL, executing a DDL statement like `ALTER TABLE` automatically issues an implicit `COMMIT` on the active transaction.',
          questionType: 'single_mcq',
          options: [
            { id: 'opt1', text: 'True' },
            { id: 'opt2', text: 'False' },
          ],
          correctAnswer: 'opt1',
          explanation: 'True. In MySQL, DDL statements cause an implicit transaction commit. You cannot ROLLBACK a CREATE, ALTER, or DROP TABLE command.',
          difficulty: 'hard',
          marks: 1,
        },
        {
          id: 'q9',
          quizId: 'quiz-day-01',
          questionText: 'Which of the following is an example of an ad-hoc query problem in traditional file systems?',
          questionType: 'single_mcq',
          options: [
            { id: 'opt1', text: 'A manager needing a new filtered report must wait for a programmer to write a new software program.' },
            { id: 'opt2', text: 'File systems run queries too quickly without user consent.' },
            { id: 'opt3', text: 'Indexes are created automatically without permission.' },
            { id: 'opt4', text: 'File systems enforce foreign keys too strictly.' },
          ],
          correctAnswer: 'opt1',
          explanation: 'Traditional file systems lack a declarative query language (like SQL), so every novel inquiry requires custom application code to be written and compiled.',
          difficulty: 'easy',
          marks: 1,
        },
        {
          id: 'q10',
          quizId: 'quiz-day-01',
          questionText: 'In a Relational DBMS, what guarantees that either all operations of a transaction complete, or none do (even during a power outage)?',
          questionType: 'single_mcq',
          options: [
            { id: 'opt1', text: 'Consistency' },
            { id: 'opt2', text: 'Atomicity' },
            { id: 'opt3', text: 'Isolation' },
            { id: 'opt4', text: 'Durability' },
          ],
          correctAnswer: 'opt2',
          explanation: 'Atomicity (the "A" in ACID) guarantees all-or-nothing execution, maintained via transaction undo/redo logs in RDBMS engines like InnoDB.',
          difficulty: 'medium',
          marks: 1,
        },
      ],
    },
  });

  // DAY 2: Data Modeling, ER Diagrams & Key Concepts
  days.push({
    id: 'day-02',
    planId: 'plan-main',
    userId: 'usr-student-01',
    dayNumber: 2,
    scheduledDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    subjectId: 'sub-mysql',
    subjectTitle: 'MySQL / DBMS',
    topicTitle: 'Data Modeling, ER Diagrams & Key Concepts',
    status: 'not_started',
    theoryStatus: 'pending',
    practicalStatus: 'pending',
    tasks: [],
  });

  // DAY 3: MySQL Data Types & Table Constraints
  days.push({
    id: 'day-03',
    planId: 'plan-main',
    userId: 'usr-student-01',
    dayNumber: 3,
    scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    subjectId: 'sub-mysql',
    subjectTitle: 'MySQL / DBMS',
    topicTitle: 'MySQL Data Types & Table Constraints',
    status: 'not_started',
    theoryStatus: 'pending',
    practicalStatus: 'pending',
    tasks: [],
  });

  // DAY 4: Python for Data Analytics: Syntax & Strings
  days.push({
    id: 'day-04',
    planId: 'plan-main',
    userId: 'usr-student-01',
    dayNumber: 4,
    scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    subjectId: 'sub-python',
    subjectTitle: 'Python for Data Analytics',
    topicTitle: 'Python Syntax, Control Flow & String Methods',
    status: 'not_started',
    theoryStatus: 'pending',
    practicalStatus: 'pending',
    tasks: [],
  });

  // DAY 5: Python Collections
  days.push({
    id: 'day-05',
    planId: 'plan-main',
    userId: 'usr-student-01',
    dayNumber: 5,
    scheduledDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    subjectId: 'sub-python',
    subjectTitle: 'Python for Data Analytics',
    topicTitle: 'Collections: Lists, Tuples, Dictionaries & Sets',
    status: 'not_started',
    theoryStatus: 'pending',
    practicalStatus: 'pending',
    tasks: [],
  });

  // SPRINT ROADMAP: Days 6 to 150
  const topicPool = [
    { subId: 'sub-mysql', subTitle: 'MySQL / DBMS', title: 'Subqueries, Correlated Subqueries & Views' },
    { subId: 'sub-mysql', subTitle: 'MySQL / DBMS', title: 'Normalization: 1NF, 2NF, 3NF & BCNF' },
    { subId: 'sub-mysql', subTitle: 'MySQL / DBMS', title: 'Indexing Strategies: B-Trees, Clustered vs Secondary' },
    { subId: 'sub-mysql', subTitle: 'MySQL / DBMS', title: 'Transactions, ACID & Isolation Levels' },
    { subId: 'sub-py', subTitle: 'Python Analytics', title: 'Functions, Lambdas, Closures & Decorators' },
    { subId: 'sub-py', subTitle: 'Python Analytics', title: 'NumPy: Multi-dimensional Arrays & Vectorization' },
    { subId: 'sub-py', subTitle: 'Python Analytics', title: 'Pandas: Series, DataFrames & Data Ingestion' },
    { subId: 'sub-py', subTitle: 'Python Analytics', title: 'Pandas: Filtering, GroupBy & Aggregations' },
    { subId: 'sub-bigdata', subTitle: 'Big Data Architecture', title: 'Hadoop Architecture, HDFS & MapReduce' },
    { subId: 'sub-bigdata', subTitle: 'Big Data Architecture', title: 'Apache Spark: RDDs, DataFrames & Spark SQL' },
    { subId: 'sub-bigdata', subTitle: 'Big Data Architecture', title: 'NoSQL Databases: MongoDB & Document Stores' },
    { subId: 'sub-placement', subTitle: 'Placement & Interviews', title: 'Advanced SQL Query Optimization & Window Functions' },
    { subId: 'sub-placement', subTitle: 'Placement & Interviews', title: 'Big Data Architecture & System Design Mock Interviews' },
    { subId: 'sub-placement', subTitle: 'Placement & Interviews', title: 'Data Analytics Capstone Project Defense & Live Coding' },
  ];

  for (let d = 6; d <= 150; d++) {
    const isPlacement = d > 120;
    const poolItem = isPlacement
      ? topicPool[11 + ((d - 121) % 3)]
      : topicPool[(d - 6) % 11];

    days.push({
      id: `day-${d.toString().padStart(2, '0')}`,
      planId: 'plan-main',
      userId: 'usr-student-01',
      dayNumber: d,
      scheduledDate: new Date(Date.now() + (d - 1) * 86400000).toISOString().split('T')[0],
      subjectId: poolItem.subId,
      subjectTitle: isPlacement ? 'Placement & Interview Prep' : poolItem.subTitle,
      topicTitle: poolItem.title,
      status: 'not_started',
      theoryStatus: 'pending',
      practicalStatus: 'pending',
      tasks: [],
    });
  }

  return days;
}

export const SEED_STUDY_DAYS: StudyDay[] = generateSeedStudyDays();

// Seed Revisions: Clean start on Day 1 (populated dynamically as student passes daily quizzes)
export const SEED_REVISIONS: RevisionItem[] = [];

// Seed Notifications: Fresh Day 1 Welcome & 150-Day Sprint Announcement
export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-01',
    userId: 'usr-student-01',
    title: 'Welcome to StudyOS AI, Harshal! 🎯',
    message: 'Day 1 of your 150-Day C-DAC PGCP-BDA sprint is now ready. Complete your theory, practical lab, and quiz to ignite your streak.',
    type: 'daily_study',
    isRead: false,
    createdAt: new Date().toISOString(),
    actionUrl: '/today',
  },
  {
    id: 'notif-02',
    userId: 'usr-student-01',
    title: '150-Day Sprint Roadmap Armed 🚀',
    message: 'Your path to Big Data mastery: 120 days technical preparation + 30 days placement and interview preparation.',
    type: 'daily_study',
    isRead: false,
    createdAt: new Date().toISOString(),
    actionUrl: '/today',
  },
];

// In-Memory / LocalStorage State Manager Keys
const STORAGE_KEYS = {
  VERSION: 'studyos_data_version',
  USER: 'studyos_user_profile',
  SETTINGS: 'studyos_user_settings',
  CURRICULUM: 'studyos_curriculum',
  STUDY_DAYS: 'studyos_study_days',
  REVISIONS: 'studyos_revisions',
  NOTIFICATIONS: 'studyos_notifications',
  QUIZ_ATTEMPTS: 'studyos_quiz_attempts',
  SUBMISSIONS: 'studyos_practical_submissions',
  EXAM_ATTEMPTS: 'studyos_exam_attempts',
};

// Safe LocalStorage Access (SSR Compatible)
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage`, e);
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage`, e);
  }
}

// Storage API Repository
export const StorageManager = {
  // Check version and auto-reset to Day 1 if legacy mock data exists
  ensureCleanVersion(): void {
    if (typeof window === 'undefined') return;
    const version = getLocalItem<string>(STORAGE_KEYS.VERSION, '');
    if (version !== CURRENT_DATA_VERSION) {
      this.resetToDayOne();
    }
  },

  getUserProfile(): UserProfile {
    this.ensureCleanVersion();
    return getLocalItem<UserProfile>(STORAGE_KEYS.USER, DEFAULT_USER);
  },

  updateUserProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...profile };
    setLocalItem(STORAGE_KEYS.USER, updated);
    return updated;
  },

  getUserSettings(): UserSettings {
    this.ensureCleanVersion();
    return getLocalItem<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  updateUserSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getUserSettings();
    const updated = { ...current, ...settings, userId: current.userId };
    setLocalItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  getCurriculum(): PreloadedSubjectData[] {
    this.ensureCleanVersion();
    return getLocalItem<PreloadedSubjectData[]>(STORAGE_KEYS.CURRICULUM, INITIAL_CURRICULUM);
  },

  saveCurriculum(curriculum: PreloadedSubjectData[]): void {
    setLocalItem(STORAGE_KEYS.CURRICULUM, curriculum);
  },

  getSubject(subjectId: string): PreloadedSubjectData | undefined {
    const curriculum = this.getCurriculum();
    return curriculum.find((c) => c.subject.id === subjectId);
  },

  addSubject(subject: Subject, modules: (Module & { topics: Topic[] })[]): void {
    const curriculum = this.getCurriculum();
    curriculum.push({ subject, modules });
    this.saveCurriculum(curriculum);
  },

  updateTopic(topicId: string, updates: Partial<Topic>): void {
    const curriculum = this.getCurriculum();
    for (const sub of curriculum) {
      for (const mod of sub.modules) {
        const topicIdx = mod.topics.findIndex((t) => t.id === topicId);
        if (topicIdx !== -1) {
          mod.topics[topicIdx] = { ...mod.topics[topicIdx], ...updates };
          // Recompute module & subject completion counts
          sub.subject.completedTopicsCount = sub.modules.reduce(
            (acc, m) => acc + m.topics.filter((t) => t.isCompleted).length,
            0
          );
          const totalTopics = sub.modules.reduce((acc, m) => acc + m.topics.length, 0);
          sub.subject.overallMastery = totalTopics > 0
            ? Math.round((sub.subject.completedTopicsCount / totalTopics) * 100)
            : 0;
          this.saveCurriculum(curriculum);
          return;
        }
      }
    }
  },

  getStudyDays(): StudyDay[] {
    this.ensureCleanVersion();
    return getLocalItem<StudyDay[]>(STORAGE_KEYS.STUDY_DAYS, SEED_STUDY_DAYS);
  },

  getTodayStudyDay(): StudyDay {
    const days = this.getStudyDays();
    const todayStr = new Date().toISOString().split('T')[0];
    const today = days.find((d) => d.scheduledDate === todayStr);
    return today || days[0];
  },

  updateStudyDay(dayId: string, updates: Partial<StudyDay>): StudyDay {
    const days = this.getStudyDays();
    const idx = days.findIndex((d) => d.id === dayId);
    if (idx !== -1) {
      days[idx] = { ...days[idx], ...updates };
      setLocalItem(STORAGE_KEYS.STUDY_DAYS, days);
      return days[idx];
    }
    return days[0];
  },

  getPracticalSubmissions(): PracticalSubmission[] {
    this.ensureCleanVersion();
    return getLocalItem<PracticalSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  },

  savePracticalSubmission(submission: PracticalSubmission): void {
    const submissions = this.getPracticalSubmissions();
    submissions.push(submission);
    setLocalItem(STORAGE_KEYS.SUBMISSIONS, submissions);
  },

  getQuizAttempts(): QuizAttempt[] {
    this.ensureCleanVersion();
    return getLocalItem<QuizAttempt[]>(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
  },

  saveQuizAttempt(attempt: QuizAttempt): void {
    const attempts = this.getQuizAttempts();
    attempts.push(attempt);
    setLocalItem(STORAGE_KEYS.QUIZ_ATTEMPTS, attempts);
  },

  getFinalExamAttempts(): FinalExamAttempt[] {
    this.ensureCleanVersion();
    return getLocalItem<FinalExamAttempt[]>(STORAGE_KEYS.EXAM_ATTEMPTS, []);
  },

  saveFinalExamAttempt(attempt: FinalExamAttempt): void {
    const attempts = this.getFinalExamAttempts();
    attempts.push(attempt);
    setLocalItem(STORAGE_KEYS.EXAM_ATTEMPTS, attempts);
  },

  getRevisions(): RevisionItem[] {
    this.ensureCleanVersion();
    return getLocalItem<RevisionItem[]>(STORAGE_KEYS.REVISIONS, SEED_REVISIONS);
  },

  saveRevisions(revisions: RevisionItem[]): void {
    setLocalItem(STORAGE_KEYS.REVISIONS, revisions);
  },

  scheduleNewRevision(topicTitle: string, subjectTitle: string, subjectId: string, topicId: string, score: number): void {
    const revisions = this.getRevisions();
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1); // 1-day spaced repetition interval

    revisions.push({
      id: `rev-${Date.now()}`,
      userId: 'usr-student-01',
      topicId,
      topicTitle,
      subjectId,
      subjectTitle,
      stage: 1,
      intervalDays: 1,
      nextRevisionDate: nextDate.toISOString().split('T')[0],
      isCompleted: false,
      lastScore: score,
    });
    this.saveRevisions(revisions);
  },

  completeRevision(revId: string): void {
    const revisions = this.getRevisions();
    const idx = revisions.findIndex((r) => r.id === revId);
    if (idx !== -1) {
      revisions[idx].isCompleted = true;
      // Spaced repetition progression: 1d -> 3d -> 7d -> 14d -> 30d
      const stage = revisions[idx].stage;
      const nextIntervals = [1, 3, 7, 14, 30];
      const nextStage = stage + 1;
      const nextDays = nextIntervals[nextStage - 1] || 30;
      
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + nextDays);

      revisions.push({
        ...revisions[idx],
        id: `rev-${Date.now()}`,
        stage: nextStage,
        intervalDays: nextDays,
        nextRevisionDate: nextDate.toISOString().split('T')[0],
        isCompleted: false,
      });
      this.saveRevisions(revisions);
    }
  },

  getNotifications(): AppNotification[] {
    this.ensureCleanVersion();
    return getLocalItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  },

  markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'createdAt'>): void {
    const notifs = this.getNotifications();
    notifs.unshift({
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  // Complete Clean Reset to Day 1 with 150-Day Target Sprint
  resetToDayOne(): void {
    if (typeof window === 'undefined') return;
    try {
      const savedSession = localStorage.getItem('studyos_owner_session');
      const savedPin = localStorage.getItem('studyos_owner_pin');

      // Clear only specific application data keys, never wipe the owner session!
      Object.values(STORAGE_KEYS).forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });

      setLocalItem(STORAGE_KEYS.VERSION, CURRENT_DATA_VERSION);
      setLocalItem(STORAGE_KEYS.USER, DEFAULT_USER);
      setLocalItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      setLocalItem(STORAGE_KEYS.CURRICULUM, INITIAL_CURRICULUM);
      setLocalItem(STORAGE_KEYS.STUDY_DAYS, generateSeedStudyDays());
      setLocalItem(STORAGE_KEYS.REVISIONS, []);
      setLocalItem(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
      setLocalItem(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
      setLocalItem(STORAGE_KEYS.SUBMISSIONS, []);
      setLocalItem(STORAGE_KEYS.EXAM_ATTEMPTS, []);

      // Restore session and pin if present
      if (savedSession) {
        localStorage.setItem('studyos_owner_session', savedSession);
      }
      if (savedPin) {
        localStorage.setItem('studyos_owner_pin', savedPin);
      }
    } catch (e) {
      console.error('Failed to reset storage to Day 1', e);
    }
  },

  resetToDemo(): void {
    this.resetToDayOne();
  },

  exportAllData(): string {
    const exportObject = {
      version: CURRENT_DATA_VERSION,
      targetDays: 150,
      user: this.getUserProfile(),
      settings: this.getUserSettings(),
      curriculum: this.getCurriculum(),
      studyDays: this.getStudyDays(),
      quizAttempts: this.getQuizAttempts(),
      submissions: this.getPracticalSubmissions(),
      examAttempts: this.getFinalExamAttempts(),
      revisions: this.getRevisions(),
      notifications: this.getNotifications(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportObject, null, 2);
  },
};
