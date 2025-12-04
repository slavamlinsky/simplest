i want to make a mini-kahut game for mi kids

✅ Version 1 — Minimum Functional Quiz App
Core features

Admin mode (you):

Create quizzes

Add questions with:

text title

optional image

4+ answer options (1 correct)

"shuffle answers" flag

Save quiz as JSON (or load from JSON).

Player mode (your children):

Select quiz

Optionally enable timer (ex: 20 seconds per question)

See question text + image

See 4 colored buttons: A / B / C / D

Show feedback immediately: correct or wrong

Move automatically to next question

Result screen

Show score: X/Y correct

Restart button

🎨 UI Screens (simple plan)

1. Home screen

List of quizzes

"Create new quiz" button

"Load quiz from JSON" button

2. Quiz Screen

Title of question

Image (optional)

Big colored answer buttons (A,B,C,D)

Timer ring or bar (optional)

3. Result Screen

Score

Show which questions were wrong

Restart

🧠 Logic Flow

Load quiz from JSON

Iterate through questions

For each question:

Shuffle answers array if shuffle: true

Start timer if enabled

On answer:

Mark correct/incorrect

Save result

Move to next question (1–2 sec delay)

Show final score

/app
/quizzes
page.tsx
[id]
page.tsx
play
page.tsx
/[q] // specific question number
page.tsx
/api
/quizzes
route.ts // returns list of quizzes (from JSON)
/editor
page.tsx // optional quiz editor later

/data
quizzes.json

/components
QuizCard.tsx
QuestionView.tsx
AnswerButton.tsx
Timer.tsx
ResultView.tsx
