import OpenAI from 'openai';
import { QuizQuestion, Topic } from '@/types';

// Server-side OpenAI client initialization
const apiKey = process.env.OPENAI_API_KEY;
const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export const openai = apiKey
  ? new OpenAI({
      apiKey,
    })
  : null;

export interface AIServiceStatus {
  isConfigured: boolean;
  model: string;
  provider: 'openai' | 'fallback_offline';
  message: string;
}

export function getAIServiceStatus(): AIServiceStatus {
  if (!apiKey || apiKey.includes('your_openai_api_key')) {
    return {
      isConfigured: false,
      model: modelName,
      provider: 'fallback_offline',
      message: 'OpenAI API key not configured. Operating in Offline Resilient Mode with curated C-DAC syllabus generators.',
    };
  }
  return {
    isConfigured: true,
    model: modelName,
    provider: 'openai',
    message: `Connected to OpenAI (${modelName}). Real-time dynamic generation active.`,
  };
}

/**
 * Generate Daily Study Quiz
 */
export async function generateDailyQuiz(
  topicTitle: string,
  subjectTitle: string,
  learningObjectives: string[],
  weakAreas: string[] = []
): Promise<QuizQuestion[]> {
  const status = getAIServiceStatus();

  if (status.isConfigured && openai) {
    try {
      const prompt = `You are a strict C-DAC PGCP-BDA instructor creating a 10-question daily assessment for:
Subject: ${subjectTitle}
Topic: ${topicTitle}
Learning Objectives: ${learningObjectives.join('; ')}
${weakAreas.length > 0 ? `Targeted weak concepts from previous attempts to reinforce: ${weakAreas.join('; ')}` : ''}

Generate exactly 10 questions adhering to this composition:
- 4 theory MCQs
- 2 concept-comparison or reasoning questions
- 2 practical/application questions
- 2 debugging, code-output, or query interpretation questions

Return STRICT JSON format:
{
  "questions": [
    {
      "id": "q1",
      "questionText": "...",
      "questionType": "single_mcq",
      "options": [
        {"id": "opt1", "text": "..."},
        {"id": "opt2", "text": "..."},
        {"id": "opt3", "text": "..."},
        {"id": "opt4", "text": "..."}
      ],
      "correctAnswer": "opt1",
      "explanation": "...",
      "difficulty": "easy" | "medium" | "hard",
      "marks": 1
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: 'You are an expert technical examiner in Big Data Analytics, RDBMS, Python, and Java. Always return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed.questions;
        }
      }
    } catch (error) {
      console.warn('OpenAI Quiz generation failed, falling back to curated generator:', error);
    }
  }

  // Curated Fallback Generator when API key is unconfigured or offline
  return generateCuratedFallbackQuiz(topicTitle, subjectTitle);
}

/**
 * Curated Fallback Quiz Generator
 * Provides realistic C-DAC questions when external API is unreachable
 */
function generateCuratedFallbackQuiz(topicTitle: string, subjectTitle: string): QuizQuestion[] {
  const isSql = subjectTitle.toLowerCase().includes('sql') || subjectTitle.toLowerCase().includes('dbms');
  const isPython = subjectTitle.toLowerCase().includes('python');

  if (isSql) {
    return [
      {
        id: `fb-1`,
        quizId: 'fallback',
        questionText: `In ${topicTitle}, what is the primary consequence of omitting the WHERE clause in a DELETE statement?`,
        questionType: 'single_mcq',
        options: [
          { id: 'opt1', text: 'Only the first row of the table is removed.' },
          { id: 'opt2', text: 'All rows in the table are permanently removed while preserving table structure.' },
          { id: 'opt3', text: 'The table schema itself is dropped.' },
          { id: 'opt4', text: 'A syntax error is thrown by the SQL engine.' },
        ],
        correctAnswer: 'opt2',
        explanation: 'DELETE without a WHERE clause empties all records from the target table while keeping the table definition intact.',
        difficulty: 'easy',
        marks: 1,
      },
      {
        id: `fb-2`,
        quizId: 'fallback',
        questionText: 'Which relational algebra operator corresponds to the SQL SELECT clause with specific column projections?',
        questionType: 'single_mcq',
        options: [
          { id: 'opt1', text: 'Sigma (σ) - Selection' },
          { id: 'opt2', text: 'Pi (π) - Projection' },
          { id: 'opt3', text: 'Rho (ρ) - Rename' },
          { id: 'opt4', text: 'Cartesian Product (×)' },
        ],
        correctAnswer: 'opt2',
        explanation: 'Projection (π) selects specific attributes (columns) from a relation, directly translating to the column list in a SQL SELECT statement.',
        difficulty: 'medium',
        marks: 1,
      },
      {
        id: `fb-3`,
        quizId: 'fallback',
        questionText: 'What distinguishes a candidate key from a super key in relational database modeling?',
        questionType: 'single_mcq',
        options: [
          { id: 'opt1', text: 'A candidate key is a minimal super key with no redundant attributes.' },
          { id: 'opt2', text: 'A super key can only contain one column, candidate keys contain multiple.' },
          { id: 'opt3', text: 'A candidate key always allows NULL values.' },
          { id: 'opt4', text: 'Super keys are only used in NoSQL databases.' },
        ],
        correctAnswer: 'opt1',
        explanation: 'A candidate key is defined as a minimal superkey: a set of attributes that uniquely identifies tuples, from which no attribute can be discarded without losing uniqueness.',
        difficulty: 'medium',
        marks: 1,
      },
      {
        id: `fb-4`,
        quizId: 'fallback',
        questionText: 'Which normal form eliminates partial functional dependency of non-prime attributes on candidate keys?',
        questionType: 'single_mcq',
        options: [
          { id: 'opt1', text: 'First Normal Form (1NF)' },
          { id: 'opt2', text: 'Second Normal Form (2NF)' },
          { id: 'opt3', text: 'Third Normal Form (3NF)' },
          { id: 'opt4', text: 'Boyce-Codd Normal Form (BCNF)' },
        ],
        correctAnswer: 'opt2',
        explanation: '2NF requires 1NF plus the complete absence of partial dependencies (non-prime attributes depending on a proper subset of a composite candidate key).',
        difficulty: 'easy',
        marks: 1,
      },
      {
        id: `fb-5`,
        quizId: 'fallback',
        questionText: 'Evaluate: How does a correlated subquery differ in execution compared to an independent subquery?',
        questionType: 'single_mcq',
        options: [
          { id: 'opt1', text: 'Correlated subqueries execute once per candidate row evaluated by the outer query.' },
          { id: 'opt2', text: 'Correlated subqueries execute only once before the outer query starts.' },
          { id: 'opt3', text: 'Correlated subqueries cannot access outer table columns.' },
          { id: 'opt4', text: 'They are identical in execution plan and performance.' },
        ],
        correctAnswer: 'opt1',
        explanation: 'A correlated subquery references columns from the outer query, requiring re-evaluation for each row processed by the outer query.',
        difficulty: 'hard',
        marks: 1,
      },
      {
        id: `fb-6`,
        quizId: 'fallback',
        questionText: 'Given query: `SELECT dept_id, COUNT(*) FROM emp WHERE salary > 50000 GROUP BY dept_id HAVING COUNT(*) > 5;` What is the execution order?',
        questionType: 'single_mcq',
        options: [
          { id: 'opt1', text: 'FROM -> WHERE -> GROUP BY -> HAVING -> SELECT' },
          { id: 'opt2', text: 'SELECT -> FROM -> WHERE -> GROUP BY -> HAVING' },
          { id: 'opt3', text: 'FROM -> GROUP BY -> HAVING -> WHERE -> SELECT' },
          { id: 'opt4', text: 'FROM -> WHERE -> SELECT -> GROUP BY -> HAVING' },
        ],
        correctAnswer: 'opt1',
        explanation: 'SQL logical processing order is FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT.',
        difficulty: 'medium',
        marks: 1,
      },
      {
        id: `fb-7`,
        quizId: 'fallback',
        questionText: 'In MySQL InnoDB, what is the default transaction isolation level?',
        questionType: 'single_mcq',
        options: [
          { id: 'opt1', text: 'READ UNCOMMITTED' },
          { id: 'opt2', text: 'READ COMMITTED' },
          { id: 'opt3', text: 'REPEATABLE READ' },
          { id: 'opt4', text: 'SERIALIZABLE' },
        ],
        correctAnswer: 'opt3',
        explanation: 'MySQL InnoDB default isolation level is REPEATABLE READ, which utilizes Multi-Version Concurrency Control (MVCC) and Next-Key Locks to prevent phantom reads.',
        difficulty: 'medium',
        marks: 1,
      },
      {
        id: `fb-8`,
        quizId: 'fallback',
        questionText: 'Which index type is physically ordered according to table row storage on disk in InnoDB?',
        questionType: 'single_mcq',
        options: [
          { id: 'opt1', text: 'Secondary B-Tree Index' },
          { id: 'opt2', text: 'Clustered Index' },
          { id: 'opt3', text: 'Full-Text Index' },
          { id: 'opt4', text: 'Hash Index' },
        ],
        correctAnswer: 'opt2',
        explanation: 'The Clustered Index dictates the physical ordering of data pages on disk. In InnoDB, the Primary Key is always the Clustered Index.',
        difficulty: 'medium',
        marks: 1,
      },
      {
        id: `fb-9`,
        quizId: 'fallback',
        questionText: 'What error occurs if an INSERT violates a FOREIGN KEY constraint with RESTRICT in MySQL?',
        questionType: 'single_mcq',
        options: [
          { id: 'opt1', text: 'Error 1452: Cannot add or update a child row: a foreign key constraint fails' },
          { id: 'opt2', text: 'Error 1062: Duplicate entry' },
          { id: 'opt3', text: 'Error 1048: Column cannot be null' },
          { id: 'opt4', text: 'Warning only; the insert proceeds with NULL' },
        ],
        correctAnswer: 'opt1',
        explanation: 'MySQL returns Error 1452 when an inserted foreign key value does not exist in the parent table.',
        difficulty: 'hard',
        marks: 1,
      },
      {
        id: `fb-10`,
        quizId: 'fallback',
        questionText: 'What is the key advantage of Common Table Expressions (WITH clause) over nested subqueries?',
        questionType: 'single_mcq',
        options: [
          { id: 'opt1', text: 'Significantly improved code readability, reusability within the same query, and support for recursive queries.' },
          { id: 'opt2', text: 'CTEs permanently write data to physical disk.' },
          { id: 'opt3', text: 'CTEs bypass all foreign key constraints.' },
          { id: 'opt4', text: 'CTEs can only be accessed by admin users.' },
        ],
        correctAnswer: 'opt1',
        explanation: 'CTEs improve query modularity, allow referencing intermediate result sets multiple times, and enable recursive hierarchical operations.',
        difficulty: 'medium',
        marks: 1,
      },
    ];
  }

  // Python default fallback
  return [
    {
      id: 'fb-py-1',
      quizId: 'fallback',
      questionText: `In Python ${topicTitle}, what is the output of \`bool([])\`, \`bool({})\`, and \`bool(0)\`?`,
      questionType: 'single_mcq',
      options: [
        { id: 'opt1', text: 'True, True, True' },
        { id: 'opt2', text: 'False, False, False' },
        { id: 'opt3', text: 'False, True, False' },
        { id: 'opt4', text: 'TypeError' },
      ],
      correctAnswer: 'opt2',
      explanation: 'Empty containers, empty sequences, and numerical zero evaluate to False in Python Boolean contexts.',
      difficulty: 'easy',
      marks: 1,
    },
    {
      id: 'fb-py-2',
      quizId: 'fallback',
      questionText: 'In Pandas, what does `df.dropna(axis=1)` do?',
      questionType: 'single_mcq',
      options: [
        { id: 'opt1', text: 'Drops rows that contain missing values.' },
        { id: 'opt2', text: 'Drops columns that contain any missing values.' },
        { id: 'opt3', text: 'Fills missing values with 1.' },
        { id: 'opt4', text: 'Resets index to 1.' },
      ],
      correctAnswer: 'opt2',
      explanation: 'axis=1 specifies column-wise operations; dropna(axis=1) removes any column containing NaN.',
      difficulty: 'medium',
      marks: 1,
    },
    {
      id: 'fb-py-3',
      quizId: 'fallback',
      questionText: 'What is the time complexity of looking up a key in a Python dictionary on average?',
      questionType: 'single_mcq',
      options: [
        { id: 'opt1', text: 'O(1)' },
        { id: 'opt2', text: 'O(n)' },
        { id: 'opt3', text: 'O(log n)' },
        { id: 'opt4', text: 'O(n^2)' },
      ],
      correctAnswer: 'opt1',
      explanation: 'Python dictionaries utilize hash tables, giving average-case O(1) key lookup and insertion.',
      difficulty: 'easy',
      marks: 1,
    },
    {
      id: 'fb-py-4',
      quizId: 'fallback',
      questionText: 'In NumPy, what is the output of `np.array([1, 2, 3]) * 2`?',
      questionType: 'single_mcq',
      options: [
        { id: 'opt1', text: 'array([2, 4, 6])' },
        { id: 'opt2', text: '[1, 2, 3, 1, 2, 3]' },
        { id: 'opt3', text: 'array([1, 2, 3, 2])' },
        { id: 'opt4', text: 'ValueError' },
      ],
      correctAnswer: 'opt1',
      explanation: 'NumPy performs element-wise vectorized multiplication. Standard Python lists would replicate elements.',
      difficulty: 'easy',
      marks: 1,
    },
    {
      id: 'fb-py-5',
      quizId: 'fallback',
      questionText: 'Which OOP principle is implemented in Python when a child class defines a method with the same name as its parent class?',
      questionType: 'single_mcq',
      options: [
        { id: 'opt1', text: 'Method Overloading' },
        { id: 'opt2', text: 'Method Overriding (Polymorphism)' },
        { id: 'opt3', text: 'Encapsulation' },
        { id: 'opt4', text: 'Data Hiding' },
      ],
      correctAnswer: 'opt2',
      explanation: 'Method Overriding allows a subclass to provide a specific implementation of an inherited parent method.',
      difficulty: 'medium',
      marks: 1,
    },
    {
      id: 'fb-py-6',
      quizId: 'fallback',
      questionText: 'What does the `re.findall(r"\\d+", text)` regular expression extract?',
      questionType: 'single_mcq',
      options: [
        { id: 'opt1', text: 'The first digit in text.' },
        { id: 'opt2', text: 'All contiguous sequences of one or more digits as a list of strings.' },
        { id: 'opt3', text: 'All characters except digits.' },
        { id: 'opt4', text: 'Boolean True if digits exist.' },
      ],
      correctAnswer: 'opt2',
      explanation: '\\d matches digits, + matches 1 or more occurrences, and findall returns all non-overlapping matches.',
      difficulty: 'medium',
      marks: 1,
    },
    {
      id: 'fb-py-7',
      quizId: 'fallback',
      questionText: 'In Pandas, which method allows pivoting and calculating multiple aggregations simultaneously?',
      questionType: 'single_mcq',
      options: [
        { id: 'opt1', text: 'df.groupby().agg()' },
        { id: 'opt2', text: 'df.sort_values()' },
        { id: 'opt3', text: 'df.drop_duplicates()' },
        { id: 'opt4', text: 'df.head()' },
      ],
      correctAnswer: 'opt1',
      explanation: 'groupby().agg({...}) executes multiple aggregate calculations across defined grouping dimensions.',
      difficulty: 'medium',
      marks: 1,
    },
    {
      id: 'fb-py-8',
      quizId: 'fallback',
      questionText: 'What is the purpose of `__init__` in Python classes?',
      questionType: 'single_mcq',
      options: [
        { id: 'opt1', text: 'Class destructor' },
        { id: 'opt2', text: 'Instance initialization constructor called upon object creation' },
        { id: 'opt3', text: 'Private method hiding' },
        { id: 'opt4', text: 'Memory allocation deallocator' },
      ],
      correctAnswer: 'opt2',
      explanation: '__init__ is the initializer method executed when a class instance is constructed.',
      difficulty: 'easy',
      marks: 1,
    },
    {
      id: 'fb-py-9',
      quizId: 'fallback',
      questionText: 'What happens if an unhandled Exception occurs inside a `try` block that has a `finally` block?',
      questionType: 'single_mcq',
      options: [
        { id: 'opt1', text: 'The `finally` block is skipped.' },
        { id: 'opt2', text: 'The `finally` block executes before the unhandled exception propagates up.' },
        { id: 'opt3', text: 'The program hangs.' },
        { id: 'opt4', text: 'The exception is silently suppressed.' },
      ],
      correctAnswer: 'opt2',
      explanation: 'A finally block executes unconditionally regardless of whether an exception is raised or caught.',
      difficulty: 'medium',
      marks: 1,
    },
    {
      id: 'fb-py-10',
      quizId: 'fallback',
      questionText: 'In Seaborn, which plot is best suited for visualizing the 5-number summary (quartiles, median, outliers) across categories?',
      questionType: 'single_mcq',
      options: [
        { id: 'opt1', text: 'sns.lineplot()' },
        { id: 'opt2', text: 'sns.boxplot()' },
        { id: 'opt3', text: 'sns.heatmap()' },
        { id: 'opt4', text: 'sns.scatterplot()' },
      ],
      correctAnswer: 'opt2',
      explanation: 'Box plots display minimum, first quartile, median, third quartile, maximum, and statistical outliers.',
      difficulty: 'easy',
      marks: 1,
    },
  ];
}

/**
 * AI Study Coach Advice Generator
 */
export async function getStudyCoachAdvice(
  studentContext: {
    completedTopics: number;
    totalTopics: number;
    weakTopics: string[];
    streak: number;
    daysRemaining: number;
    latestScore?: number;
  },
  userQuery?: string
): Promise<string> {
  const status = getAIServiceStatus();
  const trimmedQuery = (userQuery || '').trim();

  if (status.isConfigured && openai) {
    try {
      const systemPrompt = `You are the StudyOS AI Lead Mentor for Harshal, a student in the C-DAC PGCP-BDA (Big Data Analytics) programme.
Provide articulate, highly pedagogical, and actionable guidance.
Always format your answers in clean Markdown with bolding, headers, code blocks (when relevant), and a dedicated "💡 C-DAC Exam Tip" callout.
Answer their specific question directly. If they asked a greeting, give an inspiring status check and invite technical questions.`;

      const userContent = trimmedQuery
        ? `Student Question / Topic Request:
"${trimmedQuery}"

Current Progress Metrics:
- Topics Completed: ${studentContext.completedTopics} of ${studentContext.totalTopics}
- Active Streak: ${studentContext.streak} days
- Target Timeline: ${studentContext.daysRemaining} days remaining for PGCP-BDA
- Weak Areas Needing Remediation: ${studentContext.weakTopics.join(', ') || 'None identified'}
- Latest Quiz Score: ${studentContext.latestScore ?? 'N/A'}%`
        : `Provide a StudyOS Coach Velocity & Study Plan based on current student status:
- Topics Completed: ${studentContext.completedTopics} of ${studentContext.totalTopics}
- Active Streak: ${studentContext.streak} days
- Target Timeline: ${studentContext.daysRemaining} days remaining for PGCP-BDA
- Weak Areas: ${studentContext.weakTopics.join(', ') || 'None'}
- Latest Quiz Score: ${studentContext.latestScore ?? 'N/A'}%`;

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
      });

      const reply = response.choices[0]?.message?.content;
      if (reply && reply.trim().length > 15) {
        return reply;
      }
    } catch (e) {
      console.warn('OpenAI Coach call failed, activating smart domain mentor engine:', e);
    }
  }

  return getSmartDomainCoachResponse(trimmedQuery, studentContext);
}

/**
 * High-Precision Offline Domain Mentor Engine
 * Provides comprehensive, syllabus-grounded explanations for C-DAC PGCP-BDA
 */
function getSmartDomainCoachResponse(
  query: string,
  ctx: {
    completedTopics: number;
    totalTopics: number;
    weakTopics: string[];
    streak: number;
    daysRemaining: number;
    latestScore?: number;
  }
): string {
  const q = query.toLowerCase();
  const pct = Math.round((ctx.completedTopics / (ctx.totalTopics || 1)) * 100);

  // 1. DECIMAL VS FLOAT IN MYSQL (Financial Calculations)
  if (
    q.includes('decimal') ||
    q.includes('float') ||
    q.includes('financial') ||
    q.includes('currency') ||
    q.includes('money')
  ) {
    return `### 💡 Why Financial Calculations Require \`DECIMAL\` instead of \`FLOAT\` in MySQL

In MySQL and enterprise relational databases, storing financial or monetary values in approximate data types like \`FLOAT\` or \`DOUBLE\` is a critical architectural anti-pattern. You must **strictly use \`DECIMAL(M, D)\`** (or \`NUMERIC\`).

---

#### 1. The Core Engineering Flaw: IEEE 754 Binary Representation
- \`FLOAT\` (4 bytes) and \`DOUBLE\` (8 bytes) represent numbers using the **IEEE 754 Binary Floating-Point** standard.
- In base-2 binary, base-10 fractions like \`0.1\` or \`0.01\` cannot be represented as finite numbers (analogous to how \`1/3 = 0.3333...\` has no finite representation in base-10).
- **The Floating Point Drift Demonstration:**
\`\`\`sql
-- In MySQL:
SELECT CAST(0.1 AS FLOAT) + CAST(0.2 AS FLOAT);
-- Evaluates to: 0.30000000447034836 (NOT 0.30)
\`\`\`
- Across millions of financial transactions or compound interest computations, these microscopic precision discrepancies accumulate into massive reconciliation errors, causing audit failures under GAAP/IFRS banking regulations.

---

#### 2. How \`DECIMAL(M, D)\` Solves This Under the Hood
- \`DECIMAL\` is an **exact fixed-point numeric type** stored in a packed binary format representing base-10 digits:
  - Every group of 9 decimal digits occupies exactly **4 bytes**.
  - **M (Precision):** The maximum total number of digits (1 to 65).
  - **D (Scale):** The number of digits after the decimal point (0 to 30).
- Example: \`DECIMAL(12, 2)\` supports values from \`-9,999,999,999.99\` up to \`+9,999,999,999.99\` with **zero mathematical rounding drift**.

---

#### 3. Production Schema Comparison
\`\`\`sql
-- ❌ ANTI-PATTERN: NEVER use for monetary values
CREATE TABLE accounts_bad (
  account_id INT PRIMARY KEY,
  balance FLOAT NOT NULL -- Silent precision loss on every debit/credit!
);

-- ✅ PRODUCTION-GRADE: Exact base-10 storage
CREATE TABLE accounts_production (
  account_id INT PRIMARY KEY,
  account_holder VARCHAR(100) NOT NULL,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  CONSTRAINT chk_positive_balance CHECK (balance >= 0.00)
);
\`\`\`

---

#### 💡 C-DAC Practical & Viva Tip:
> **Examiner Question:** *"Can't we simply use \`ROUND(FLOAT_COLUMN, 2)\` in our queries to handle money?"*
> 
> **Winning Viva Answer:** No! Rounding a float only masks display errors; it does not fix accumulated drift during aggregation (\`SUM()\`), multi-step currency conversion, or interest compounding. Only \`DECIMAL\` enforces exact fixed-point storage at the storage engine level.`;
  }

  // 2. GREETINGS & MENTOR INTRODUCTIONS
  if (
    !q ||
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.startsWith('hi ') ||
    q.startsWith('hello ') ||
    q.includes('who are you') ||
    q.includes('what can you do')
  ) {
    return `### 👋 Welcome, Harshal! StudyOS AI Mentor Standing By.

I am your personalized **AI Study Coach** for the **C-DAC PGCP-BDA (Big Data Analytics)** programme. I track your syllabus milestones, strengthen your weak concepts, and prepare you for technical exams and vivas.

---

#### 🎯 Your Sprint Status at a Glance:
- **Programme Sprint:** Day 1 of 150 (Technical Preparation Sprint)
- **Syllabus Coverage:** **${ctx.completedTopics}/${ctx.totalTopics} topics (${pct}%)** completed
- **Active Streak:** **${ctx.streak} days** 🔥
- **Exam Countdown:** **${ctx.daysRemaining} days** remaining

---

#### 🚀 Recommended Focus Today (Day 1):
1. **Theory (50m):** Relational Architecture, File Systems vs DBMS, and ANSI/SPARC 3-tier model.
2. **Practical Lab (60m):** MySQL DDL Schema script for Departments and Employees with strict constraints.
3. **Daily Assessment:** Complete Theory and Lab verification to unlock today's AI Quiz Arena!

---

💡 **Try asking me:**
- *"Explain why financial calculations require DECIMAL instead of FLOAT in MySQL."*
- *"Give me 3 high-yield viva questions on Python OOP and MRO."*
- *"What should I prioritize in my study session today?"*
- *"Explain the difference between ON DELETE CASCADE and RESTRICT."*`;
  }

  // 3. STUDY PRIORITIZATION & PACING
  if (
    q.includes('prioritize') ||
    q.includes('schedule') ||
    q.includes('today') ||
    q.includes('pacing') ||
    q.includes('velocity') ||
    q.includes('track')
  ) {
    return `### 🎯 StudyOS Coach Velocity & Daily Action Plan

**Pace Analysis:** You have **${ctx.daysRemaining} days** remaining in your 150-day PGCP-BDA sprint. You have completed **${ctx.completedTopics}/${ctx.totalTopics} topics (${pct}%)**. Maintaining daily 120-minute sessions guarantees full technical syllabus completion with 30+ days reserved for placements.

---

#### ⏱️ Today's Optimized 120-Minute Allocation:
1. **Theory Block (50 Minutes):**
   - **Topic:** MySQL Relational Model & ANSI/SPARC Architecture.
   - **Core Concepts:** 3-tier schema isolation (Internal, Conceptual, External views), logical vs physical data independence.
2. **Practical Hands-On Lab (60 Minutes):**
   - **Challenge:** Department & Employee schema definition script.
   - **Crucial Syntax:** Declare primary keys, foreign keys with referential integrity, \`UNIQUE\`, and \`CHECK\` constraints.
3. **Active Recall & Quiz (10 Minutes):**
   - Review Candidate Keys vs Super Keys.
   - Complete the unlocked Daily AI Quiz (Pass mark: 80%).

---

#### 💡 C-DAC Exam Tip:
> In C-DAC practical evaluations, examiners will immediately check whether your child foreign key columns match the parent table's data type, signedness, and character set. Always ensure exact type parity!`;
  }

  // 4. PYTHON OOP & MRO VIVA QUESTIONS
  if (
    q.includes('mro') ||
    (q.includes('python') && (q.includes('oop') || q.includes('viva') || q.includes('class') || q.includes('inheritance')))
  ) {
    return `### 🐍 High-Yield Viva Guide: Python OOP & Method Resolution Order (MRO)

Python's object-oriented model is a core pillar of the C-DAC Big Data programme, especially for PySpark transformations and data pipeline architecture.

---

#### 1. What is MRO & The C3 Linearization Algorithm?
- **MRO (Method Resolution Order)** defines the exact order in which base classes are searched when calling a method on an object in Python.
- Python 3 utilizes the **C3 Linearization algorithm** to resolve multiple inheritance and avoid the **Diamond Problem**.
- You can inspect the resolution order using \`ClassName.__mro__\` or \`ClassName.mro()\`.

\`\`\`python
class A:
    def greet(self): return "A"

class B(A):
    def greet(self): return "B"

class C(A):
    def greet(self): return "C"

class D(B, C):
    pass

print(D.__mro__)
# Output order: (D, B, C, A, object)
# Calling d.greet() executes B.greet() first!
\`\`\`

---

#### 2. Top 3 C-DAC Viva Questions on Python OOP:
1. **Q: How does \`super()\` behave in multiple inheritance?**
   - **A:** \`super()\` does not simply call the parent class; it delegates method calls dynamically along the **MRO** chain of the invoking instance, ensuring each class is visited once without infinite recursion in diamond hierarchies.
2. **Q: What is the difference between \`__init__\` and \`__new__\`?**
   - **A:** \`__new__\` is the true constructor method that creates and returns a new object instance in memory (used in singletons and immutable subclassing). \`__init__\` is the initializer that configures attributes on that created instance.
3. **Q: How does Python achieve encapsulation if variables are public by default?**
   - **A:** Python uses naming conventions: single underscore (\`_var\`) indicates protected by convention, and double underscore (\`__var\`) triggers **Name Mangling** (\`_ClassName__var\`) to prevent accidental attribute overrides in subclasses.

---

#### 💡 C-DAC Practical Tip:
> When writing custom PySpark UDFs or map/reduce helper classes, always inherit from \`object\` and implement \`__repr__\` for clean debugging in distributed cluster logs!`;
  }

  // 5. SQL CONSTRAINTS & REFERENTIAL INTEGRITY
  if (
    q.includes('constraint') ||
    q.includes('cascade') ||
    q.includes('restrict') ||
    q.includes('foreign key') ||
    q.includes('referential')
  ) {
    return `### 🛡️ Masterclass: MySQL Constraints & Referential Integrity

Constraints are declarative rules enforced by the MySQL InnoDB engine to maintain data consistency and prevent orphaned child records.

---

#### 1. Core Constraint Types:
- \`PRIMARY KEY\`: Combines \`NOT NULL\` and \`UNIQUE\`. In InnoDB, physically structures the table as a **Clustered Index**.
- \`FOREIGN KEY\`: References a \`PRIMARY KEY\` or \`UNIQUE\` key in a parent table to enforce **Referential Integrity**.
- \`CHECK\`: Enforces boolean predicates (e.g., \`CHECK (salary > 0)\`). Supported and strictly enforced in MySQL 8.0+.
- \`UNIQUE\`: Ensures all non-null values in a column are distinct. Multiple \`NULL\` values are allowed in InnoDB.

---

#### 2. \`ON DELETE\` Actions Compared:
\`\`\`sql
CREATE TABLE employees (
  emp_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  dept_id INT,
  CONSTRAINT fk_emp_dept FOREIGN KEY (dept_id)
    REFERENCES departments(dept_id)
    ON DELETE RESTRICT      -- Blocks deletion of parent dept if employees exist
    ON UPDATE CASCADE       -- If dept_id changes in parent, auto-updates child
);
\`\`\`
- **\`RESTRICT\` / \`NO ACTION\` (Default):** Rejects \`DELETE\` or \`UPDATE\` on the parent table if related child records exist (MySQL Error 1451).
- **\`CASCADE\`:** Automatically propagates parent deletion/update to matching child records.
- **\`SET NULL\`:** Sets child foreign key column to \`NULL\` when parent is deleted (child column must not be \`NOT NULL\`).

---

#### 💡 C-DAC Exam Tip:
> Evaluators often test MySQL **Error 1452** (*Cannot add or update a child row: a foreign key constraint fails*). This happens when attempting to insert a foreign key value into a child table that does not currently exist in the parent table!`;
  }

  // 6. SQL JOINS & PERFORMANCE
  if (q.includes('join') || q.includes('inner join') || q.includes('left join')) {
    return `### 🔗 MySQL Joins: Mechanics, Syntax & Optimization

Joins allow querying data across related tables based on common predicate columns.

---

#### 1. The 4 Key Join Types:
1. **\`INNER JOIN\`:** Returns only rows where there is a match in both tables.
2. **\`LEFT JOIN\` (LEFT OUTER JOIN):** Returns all rows from the left table, plus matched rows from the right table (unmatched right columns return \`NULL\`).
3. **\`RIGHT JOIN\`:** Returns all rows from the right table, plus matched left rows.
4. **\`CROSS JOIN\`:** Produces Cartesian Product ($N \\times M$ rows).

---

#### 2. Clean SQL Example:
\`\`\`sql
-- Retrieve all departments and their employee count (including empty depts)
SELECT 
  d.dept_name,
  COUNT(e.emp_id) AS total_employees
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_id, d.dept_name;
\`\`\`

---

#### 💡 C-DAC Exam Tip:
> Always index join predicate columns (foreign keys). Without an index on the joined child column, MySQL executes a costly **Block Nested Loop (BNL)** scan instead of an efficient index lookup!`;
  }

  // 7. BIG DATA, HADOOP & SPARK
  if (
    q.includes('big data') ||
    q.includes('hadoop') ||
    q.includes('spark') ||
    q.includes('hdfs') ||
    q.includes('rdd') ||
    q.includes('mapreduce')
  ) {
    return `### ⚡ Big Data Architecture: Hadoop HDFS vs Apache Spark

Understanding distributed storage and compute trade-offs is essential for the C-DAC PGCP-BDA curriculum.

---

#### 1. Hadoop HDFS Architecture:
- **Master/Slave Model:**
  - **NameNode (Master):** Stores filesystem metadata and block mapping in memory.
  - **DataNodes (Slaves):** Store actual data blocks (default size: **128 MB** in modern Hadoop).
- **Fault Tolerance:** Default replication factor is **3** across different racks (Rack Awareness).

---

#### 2. Apache Spark vs Hadoop MapReduce:
- **MapReduce:** Writes intermediate results to disk after every Map and Reduce phase, causing heavy disk I/O bottlenecks.
- **Spark:** Executes computations in-memory using **RDDs (Resilient Distributed Datasets)** and directed acyclic graphs (**DAGs**), achieving up to 100x faster execution for iterative algorithms and machine learning.

---

#### 💡 C-DAC Viva Tip:
> **Question:** *"Why are Spark RDD transformations called 'Lazy'?"*
> 
> **Answer:** Transformations (like \`map\`, \`filter\`) do not execute immediately; they build a logical DAG plan. Execution only triggers when an **Action** (like \`count\`, \`collect\`, \`saveAsTextFile\`) is invoked, allowing Spark's Catalyst Optimizer to optimize the pipeline!`;
  }

  // 8. GENERAL HIGH-YIELD TECHNICAL COACH FALLBACK
  return `### 🎯 StudyOS Coach Technical Analysis

**Topic Analysis for:** *"${query}"*

---

#### 1. Core Engineering Principle:
In enterprise computing and the C-DAC Big Data curriculum, mastering the foundational specifications (relational calculus, ACID guarantees, distributed compute models) separates senior developers from junior coders.

---

#### 2. Recommended Implementation Strategy:
1. **Deconstruct the Problem:** Identify whether the question concerns storage (disk, memory, index), compute (CPU, execution plan), or consistency (transactions, locks).
2. **Verify Against Schemas:** Always inspect primary keys, column types, and constraints before optimizing queries.
3. **Benchmark Real Performance:** Use \`EXPLAIN ANALYZE\` in MySQL or Spark DAG UI to verify query execution plans.

---

#### 💡 C-DAC Examination Tip:
> During technical vivas, always state the standard definition first, cite an edge case or failure mode (like constraint violation or precision loss), and conclude with the production-recommended syntax or architecture.

---

🧠 **Next Step:** You have completed **${ctx.completedTopics}/${ctx.totalTopics} topics** with **${ctx.daysRemaining} days** remaining. Head over to **Today's Session** to complete your lab and unlock today's AI Quiz!`;
}
