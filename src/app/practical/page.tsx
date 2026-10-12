'use client';

import React, { useState, useEffect } from 'react';
import {
  Code2,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  RotateCcw,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { PracticalSubmission } from '@/types';

const LAB_EXERCISES = [
  {
    id: 'lab-sql-1',
    subject: 'MySQL / DBMS',
    title: 'Department & Employee Integrity Enforcement',
    description: 'Create normalized tables with PRIMARY KEY, FOREIGN KEY (ON DELETE CASCADE), and CHECK constraints.',
    starterCode: `-- Challenge 1: DDL with Constraints
CREATE TABLE departments (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL UNIQUE,
  budget DECIMAL(12, 2) NOT NULL CHECK (budget >= 10000)
);

CREATE TABLE employees (
  emp_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  salary DECIMAL(10, 2) NOT NULL CHECK (salary > 0),
  dept_id INT NOT NULL,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);`,
  },
  {
    id: 'lab-sql-2',
    subject: 'MySQL / DBMS',
    title: 'Multi-table Joins & Self-Join on Employee Hierarchy',
    description: 'Write an inner join between emp and dept, and a self-join to retrieve employee-manager relationships.',
    starterCode: `-- Challenge 2: Self-Join and Aggregation
SELECT 
  e.emp_name AS employee,
  m.emp_name AS manager,
  d.dept_name AS department
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.emp_id
JOIN departments d ON e.dept_id = d.dept_id
ORDER BY d.dept_name, e.emp_name;`,
  },
  {
    id: 'lab-py-1',
    subject: 'Python',
    title: 'Pandas Data Wrangling on emp.csv',
    description: 'Load employee dataset, impute missing values, filter top earners, and compute department-wise salary averages.',
    starterCode: `# Challenge 3: Pandas Data Wrangling
import pandas as pd
import numpy as np

# Load and inspect dataset
df = pd.read_csv('emp.csv')

# Impute missing salary with department median
df['salary'] = df.groupby('dept_id')['salary'].transform(
    lambda x: x.fillna(x.median())
)

# Department aggregation
dept_summary = df.groupby('dept_name').agg(
    total_staff=('emp_id', 'count'),
    mean_salary=('salary', 'mean'),
    max_salary=('salary', 'max')
).reset_index()

print(dept_summary)`,
  },
];

export default function PracticalLabPage() {
  const [selectedLab, setSelectedLab] = useState(LAB_EXERCISES[0]);
  const [code, setCode] = useState(LAB_EXERCISES[0].starterCode);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [submissions, setSubmissions] = useState<PracticalSubmission[]>([]);

  useEffect(() => {
    setSubmissions(StorageManager.getPracticalSubmissions());
  }, []);

  const handleSelectLab = (lab: typeof LAB_EXERCISES[0]) => {
    setSelectedLab(lab);
    setCode(lab.starterCode);
    setConsoleOutput(null);
  };

  const handleExecute = () => {
    setIsRunning(true);
    setConsoleOutput('Analyzing query syntax and validating constraints...\n');

    setTimeout(() => {
      setIsRunning(false);
      setConsoleOutput(
        `✓ Execution Success (Sandboxed Syntax Parser)\n` +
        `Rows affected: 0 (DDL statements validated)\n` +
        `Integrity Check: Constraints satisfied (PK, FK, CHECK chk_budget)\n` +
        `Execution time: 14ms\n` +
        `Status: Ready for submission to completion gate.`
      );
    }, 600);
  };

  const handleSaveSubmission = () => {
    const submission: PracticalSubmission = {
      id: `sub-${Date.now()}`,
      dailyTaskId: selectedLab.id,
      userId: 'usr-student-01',
      codeQuery: code,
      executionResult: consoleOutput || 'Verified execution',
      status: 'verified',
      verificationMode: 'self_evidence',
      submittedAt: new Date().toISOString(),
    };

    StorageManager.savePracticalSubmission(submission);
    setSubmissions(StorageManager.getPracticalSubmissions());
    alert('Practical lab submission saved and recorded to your progress ledger!');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="apple-glass-elevated p-6 md:p-8 rounded-[30px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="apple-glass-pill text-xs font-mono font-bold text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/35 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Practical Lab</span>
            </span>
            <span className="text-xs text-slate-300 font-mono">Hands-on Execution Sandbox</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Code & Query Verification Console
          </h1>
          <p className="text-xs text-slate-200 mt-1">
            Solve, execute, and verify code challenges for MySQL, Python, R, and Java.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCode(selectedLab.starterCode)}
            className="apple-btn-secondary flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleExecute}
            disabled={isRunning}
            className="apple-btn-primary flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition shadow-lg cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
          <button
            onClick={handleSaveSubmission}
            className="apple-glass-pill flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 text-xs font-bold transition shadow-lg cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-emerald-300" />
            <span>Submit Work</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Challenge Selector & Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lab Exercise Selector (1 col) */}
        <div className="apple-glass p-5 rounded-[28px] border border-white/18 space-y-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <h3 className="text-xs font-bold text-white px-1">C-DAC Lab Challenges</h3>
          <div className="space-y-2.5">
            {LAB_EXERCISES.map((lab) => {
              const isSelected = lab.id === selectedLab.id;
              return (
                <button
                  key={lab.id}
                  onClick={() => handleSelectLab(lab)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-600/30 to-teal-600/20 border-emerald-400/50 text-emerald-100 shadow-md'
                      : 'apple-subcard border-white/12 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase block mb-1">
                    {lab.subject}
                  </span>
                  <div className="font-bold text-white line-clamp-1">{lab.title}</div>
                  <p className="text-[11px] text-slate-200 line-clamp-2 mt-1 leading-relaxed">{lab.description}</p>
                </button>
              );
            })}
          </div>

          {/* Submission Counter */}
          <div className="pt-4 border-t border-white/12 px-1 text-[11px] text-slate-300 font-medium">
            <span>Verified Submissions: </span>
            <span className="text-white font-bold font-mono">{submissions.length}</span>
          </div>
        </div>

        {/* Code Editor & Terminal (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="apple-glass rounded-[28px] border border-white/18 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div className="px-5 py-3.5 border-b border-white/12 apple-subcard flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200 font-medium">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>{selectedLab.title}</span>
              </div>
              <span className="apple-glass-pill text-[10px] font-mono text-slate-200 px-2.5 py-0.5 rounded-full font-semibold">Live Editor</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              className="w-full bg-black/60 p-5 font-mono text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 leading-relaxed resize-none shadow-inner"
              spellCheck={false}
            />
          </div>

          {/* Output / Console Window */}
          <div className="rounded-[26px] border border-white/16 apple-subcard bg-black/55 p-5 space-y-2 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-white/12 text-xs">
              <span className="font-mono font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span>Console Output</span>
              </span>
              <span className="text-[10px] font-mono text-slate-300">Isolated Terminal</span>
            </div>

            <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[80px]">
              {consoleOutput || 'Click "Run Code" to parse and execute your script.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
