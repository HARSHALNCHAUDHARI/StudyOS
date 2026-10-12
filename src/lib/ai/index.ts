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
export async function getStudyCoachAdvice(studentContext: {
  completedTopics: number;
  totalTopics: number;
  weakTopics: string[];
  streak: number;
  daysRemaining: number;
  latestScore?: number;
}): Promise<string> {
  const status = getAIServiceStatus();

  if (status.isConfigured && openai) {
    try {
      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: 'You are the StudyOS AI Lead Mentor for a C-DAC PGCP-BDA student. Give concise, highly motivating, tactical advice grounded in their exact metrics.',
          },
          {
            role: 'user',
            content: `Student Stats:
- Topics completed: ${studentContext.completedTopics} of ${studentContext.totalTopics}
- Weak topics needing remediation: ${studentContext.weakTopics.join(', ') || 'None identified'}
- Study streak: ${studentContext.streak} days
- Timeline remaining: ${studentContext.daysRemaining} days until PGCP-BDA Final Exam
- Latest quiz score: ${studentContext.latestScore ?? 'N/A'}%

Provide:
1. Progress velocity analysis (are they on track?)
2. Tactical advice for today's 120-minute allocation (50m theory, 60m practical, 10m recall)
3. One concrete C-DAC examination tip.`,
          },
        ],
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || getFallbackCoachAdvice(studentContext);
    } catch (e) {
      console.warn('AI Coach response failed, using fallback:', e);
    }
  }

  return getFallbackCoachAdvice(studentContext);
}

function getFallbackCoachAdvice(ctx: {
  completedTopics: number;
  totalTopics: number;
  weakTopics: string[];
  streak: number;
  daysRemaining: number;
}): string {
  const pct = Math.round((ctx.completedTopics / (ctx.totalTopics || 1)) * 100);
  return `### 🎯 StudyOS Coach Velocity Report
**Pace Status:** You have completed **${ctx.completedTopics}/${ctx.totalTopics} topics (${pct}%)** with **${ctx.daysRemaining} days** remaining before technical syllabus completion. Maintaining your **${ctx.streak}-day streak** keeps you comfortably on track.

**Daily 120-Minute Focus Today:**
1. **Theory (50 mins):** Complete MySQL Data Types & Table Constraints. Focus on referential integrity nuances (\`ON DELETE CASCADE\` vs \`RESTRICT\`).
2. **Practical Lab (60 mins):** Code the schema definition script for departments and employees. Verify \`CHECK\` constraint enforcement.
3. **Recall (10 mins):** Active recall of Candidate Keys vs Super Keys.

**💡 C-DAC Exam Tip:** In C-DAC practical and viva examinations, evaluators routinely test whether your child foreign key columns have matching data types and signedness with the parent table. Always ensure exact type parity!`;
}
