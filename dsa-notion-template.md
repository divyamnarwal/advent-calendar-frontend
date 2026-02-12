# DSA Mastery Notion Template

> Starting: Sunday, February 1, 2026
> Goal: Placements/Internships Preparation
> Level: Beginner
> Platform: LeetCode

---

## Database 1: Weekly Schedule (Template)

### Properties to Create:
| Property | Type | Values |
|----------|------|--------|
| Week | Number | 1, 2, 3, ... |
| Start Date | Date | |
| Status | Select | Planning, In Progress, Completed |
| Progress | Number | 0-100% |
| Focus Topic | Multi-select | Arrays, Strings, Linked Lists, etc. |

### Weekly Template (Copy each week):

```
Week 1: Feb 2-8, 2026
Status: In Progress
Focus: Arrays & Hashing
```

#### Sunday (Feb 2)
- [ ] **Learning Block (90 min)**
  - [ ] Two Pointers pattern theory
  - [ ] Sliding Window concept
  - [ ] Take notes in "Concepts" database
- [ ] **Practice (60 min)**
  - [ ] Easy: LeetCode 125 (Valid Palindrome)
  - [ ] Easy: LeetCode 167 (Two Sum II)
- [ ] **Daily Log** → Link to Daily Log entry

#### Monday (Feb 3)
- [ ] **Revision (30 min)**
  - [ ] Review yesterday's notes
  - [ ] Re-solve Sunday problems without looking
- [ ] **Practice (90 min)**
  - [ ] Medium: LeetCode 15 (3Sum)
  - [ ] Medium: LeetCode 11 (Container With Most Water)
- [ ] **Daily Log**

#### Tuesday (Feb 4)
- [ ] **Learning Block (60 min)**
  - [ ] Prefix Sum pattern
- [ ] **Practice (90 min)**
  - [ ] Medium: LeetCode 209 (Minimum Size Subarray Sum)
  - [ ] Medium: LeetCode 560 (Subarray Sum Equals K)
- [ ] **Daily Log**

#### Wednesday (Feb 5)
- [ ] **Revision (30 min)**
  - [ ] Review this week's patterns
- [ ] **Practice (90 min)**
  - [ ] Medium: LeetCode 238 (Product of Array Except Self)
  - [ ] Easy: LeetCode 724 (Find Pivot Index)
- [ ] **Daily Log**

#### Thursday (Feb 6)
- [ ] **Learning Block (60 min)**
  - [ ] Cyclic Sort pattern
  - [ ] Hash Map deep dive
- [ ] **Practice (90 min)**
  - [ ] Medium: LeetCode 49 (Group Anagrams)
  - [ ] Medium: LeetCode 347 (Top K Frequent Elements)
- [ ] **Daily Log**

#### Friday (Feb 7)
- [ ] **Revision (45 min)**
  - [ ] Week recap - all patterns
- [ ] **Practice (90 min)**
  - [ ] Hard attempt: LeetCode 42 (Trapping Rain Water)
  - [ ] Easy: LeetCode 268 (Missing Number)
- [ ] **Daily Log**

#### Saturday (Feb 8)
- [ ] **Weekly Assessment (60 min)**
  - [ ] Timed: 2 problems from本周 (45 min total)
  - [ ] Self-grade: Did I recognize patterns quickly?
- [ ] **Weekly Review (30 min)**
  - [ ] What went well: ___________
  - [ ] Struggled with: ___________
  - [ ] Next week focus: ___________
- [ ] **Update Progress Tracker**

---

## Database 2: Problem Log

### Properties:
| Property | Type | Values |
|----------|------|--------|
| Problem Name | Title | |
| LeetCode # | Number | |
| Difficulty | Select | Easy, Medium, Hard |
| Pattern | Multi-select | Two Pointers, Sliding Window, DP, etc. |
| Status | Select | To Solve, Solved, Mastered, Need Revision |
| Attempts | Number | 1, 2, 3, 4+ |
| Time Taken | Text | e.g., "25 min", "45 min" |
| Date Solved | Date | |
| Revisit Date | Formula | Date Solved + 3 days |
| Notes | Text | |
| My Solution | URL | Link to your code |

### Sample Entry:
| Name | # | Difficulty | Pattern | Status | Attempts | Time | Revisit |
|------|---|------------|---------|--------|----------|------|---------|
| Valid Palindrome | 125 | Easy | Two Pointers | Solved | 1 | 12 min | Feb 5 |
| 3Sum | 15 | Medium | Two Pointers | Need Revision | 3 | 45 min | Feb 8 |

---

## Database 3: Concepts / Pattern Notes

### Properties:
| Property | Type |
|----------|------|
| Pattern Name | Title |
| Category | Select (Array, String, Tree, Graph, DP, etc.) |
| Mastery Level | Select (Learning, Practiced, Comfortable, Mastered) |
| Key Points | Text |
| Template Code | Code |
| Practice Problems | Relation to Problem Log |
| Last Revised | Date |

### Template Entry Example:

```
Pattern Name: Sliding Window
Category: Array
Mastery Level: Learning
Last Revised: Feb 2, 2026

Key Points:
- Use when subarray/substring problems with size constraint
- Fixed window: adjust window size, slide through
- Variable window: expand right, shrink from left
- Time: O(n), Space: O(k) where k = window size

Template Code:
def slidingWindow(arr, k):
    left = 0
    result = []
    curr_window = 0

    for right in range(len(arr)):
        # Add element to window
        curr_window += arr[right]

        # When window exceeds size
        if right - left + 1 > k:
            curr_window -= arr[left]
            left += 1

        # Record result when window is valid size
        if right - left + 1 == k:
            result.append(curr_window)

    return result

Practice Problems: [209, 3, 76, 424]
```

---

## Database 4: Daily Log

### Properties:
| Property | Type |
|----------|------|
| Date | Date |
| Mood | Select (Energized, Focused, Tired, Frustrated) |
| Problems Solved | Number |
| Time Spent | Number (minutes) |
| Learnings | Text |
| Struggles | Text |
| Tomorrow's Plan | Text |

### Daily Log Template:

```markdown
Date: Feb 2, 2026
Mood: Focused
Problems Solved: 2
Time Spent: 150 min

Learnings:
- Two pointers work well for sorted arrays
- Always think about edge cases (duplicates, empty input)

Struggles:
- Took too long on 3Sum edge cases
- Need to practice avoiding overflow

Tomorrow's Plan:
- Re-solve 3Sum without looking
- Start Sliding Window pattern
```

---

## Database 5: Progress Tracker

### Properties:
| Property | Type |
|----------|------|
| Date | Date |
| Total Problems | Number |
| Easy Solved | Number |
| Medium Solved | Number |
| Hard Solved | Number |
| Streak Days | Number |
| Patterns Learned | Number |
| Current Phase | Select (Phase 1-4) |
| Notes | Text |

### Weekly Entry Template:

```markdown
Date: Feb 8, 2026 (End of Week 1)

Stats:
┌─────────────────────┬──────────┐
│ Total Problems      │    10    │
│ Easy                │     7    │
│ Medium              │     3    │
│ Hard                │     0    │
│ Streak              │    7 days│
│ Patterns Learned    │     3    │
└─────────────────────┴──────────┘

Phase: Phase 1 - Arrays & Hashing (30% complete)

This Week:
✓ Two Pointers
✓ Sliding Window - Fixed
○ Sliding Window - Variable
✗ Prefix Sum

Next Week Goals:
- Master Sliding Window variable size
- Learn Prefix Sum deeply
- Start String patterns

Reflection:
First week felt good. Two pointers made sense once I saw the pattern.
Sliding window with variable size is confusing - need more practice.
```

---

## Dashboard Views to Create

### View 1: Today's Plan
Filter: Date = Today
Show: Tasks from Weekly Schedule

### View 2: Problems to Revise
Filter: Revisit Date ≤ Today AND Status ≠ Mastered
Sort by: Revisit Date (ascending)

### View 3: Pattern Mastery
Group by: Pattern Category
Filter: Mastery Level ≠ Mastered

### View 4: Weekly Goals
Filter: Week = Current Week
Show: Weekly progress

### View 5: Streak Calendar
Calendar view of Daily Log
Track consecutive days

---

## How to Set Up in Notion

### Step 1: Create DSA Workspace
1. Create new page: "DSA Mastery 2026"
2. Add sub-pages for each database
3. Create linked views on main dashboard

### Step 2: Create Databases
1. Click "Add a database" → Table
2. Add properties as specified above
3. Create templates for daily/weekly entries

### Step 3: Set Up Relations
- Problem Log ←→ Concepts (Practice Problems)
- Weekly Schedule ←→ Daily Log
- Weekly Schedule ←→ Progress Tracker

### Step 4: Create Your First Week
1. Duplicate the Week 1 template
2. Adjust dates to match your start date
3. Fill in specific problems
4. Link to LeetCode problems

---

## Quick Import Format (CSV)

### problems.csv (Import into Problem Log)
```csv
Name,Number,Difficulty,Pattern,Status,Attempts,Time,Revisit_Date
Valid Palindrome,125,Easy,Two Pointers,To Solve,0,,,
Two Sum II,167,Easy,Two Pointers,To Solve,0,,,
3Sum,15,Medium,Two Pointers,To Solve,0,,,
Container With Most Water,11,Medium,Two Pointers,To Solve,0,,,
Trapping Rain Water,42,Hard,Two Pointers,To Solve,0,,,
Minimum Size Subarray Sum,209,Medium,Sliding Window,To Solve,0,,,
Subarray Sum Equals K,560,Medium,Prefix Sum,To Solve,0,,,
Product of Array Except Self,238,Medium,Arrays,To Solve,0,,,
Find Pivot Index,724,Easy,Prefix Sum,To Solve,0,,,
Group Anagrams,49,Medium,Hashing,To Solve,0,,,
Top K Frequent Elements,347,Medium,Heap/Hash,To Solve,0,,,
Missing Number,268,Easy,Cyclic Sort,To Solve,0,,,
Valid Anagram,242,Easy,Hashing,To Solve,0,,,
Contains Duplicate,217,Easy,Hashing,To Solve,0,,,
```

---

## Weekly Time Allocation (Recommended)

```
Daily (Mon-Fri):
├── 7:00-7:30 AM   → Morning revision (30 min)
├── 4:00-5:30 PM   → Learning + Practice (90 min)
└── 9:00-9:15 PM   → Quick recap (15 min)

Saturday:
└── 10:00-11:30 AM → Mock contest + weekly review (90 min)

Sunday:
└── 11:00 AM-1:00 PM → Learning new concepts + planning (120 min)

Total: ~12 hours/week
```

---

## 12-Week Complete Schedule

| Week | Dates | Focus | Key Patterns |
|------|-------|-------|--------------|
| 1 | Feb 2-8 | Arrays Intro | Two Pointers, Sliding Window |
| 2 | Feb 9-15 | Arrays Deep | Prefix Sum, Cyclic Sort |
| 3 | Feb 16-22 | Strings | Pattern Matching, Substrings |
| 4 | Feb 23 - Mar 1 | Hashing | Frequency Counter, Sets |
| 5 | Mar 2-8 | Linked Lists | Fast/Slow, Reversal |
| 6 | Mar 9-15 | Stacks/Queues | Monotonic Stack, Valid Parentheses |
| 7 | Mar 16-22 | Trees Basic | Traversals, Level Order |
| 8 | Mar 23-29 | Trees Advanced | Paths, Views, BST |
| 9 | Mar 30 - Apr 5 | Heaps | Priority Queue, Top K |
| 10 | Apr 6-12 | Graphs | BFS, DFS, Matrix |
| 11 | Apr 13-19 | Dynamic Programming | 1D DP, 2D DP |
| 12 | Apr 20-26 | Revision + Mocks | Mixed practice |

---

## Success Checklist

### Weekly:
- [ ] Complete all scheduled problems
- [ ] Log every problem in database
- [ ] Review pattern notes
- [ ] Update progress tracker
- [ ] Complete weekly assessment

### Daily:
- [ ] Mark tasks complete
- [ ] Fill daily log
- [ ] Note struggles for tomorrow
- [ ] Maintain streak

---

## Reminders to Set

1. **Daily 4 PM**: DSA Practice Time
2. **Saturday 10 AM**: Weekly Mock Contest
3. **Every 3 days**: "Revisit Problems" reminder
4. **Sunday 11 AM**: Plan next week

---

*Template created for DSA preparation journey starting Feb 2, 2026*
*Goal: Placement/Interview readiness by April 2026*
