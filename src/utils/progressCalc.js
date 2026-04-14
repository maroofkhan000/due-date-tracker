/**
 * Recalculates completed tasks and progress % after a field toggle.
 *
 * @param {object} course   - The full course document from Firestore
 * @param {string} field    - The field being toggled (e.g. 'assignment1', 'quiz2', 'done')
 * @param {boolean} newState - The new value of the field after toggle
 * @returns {{ completed: number, total: number, prog: number }}
 */
export function calcProgress(course, field, newState) {
  // Special case: single-toggle item (imp things)
  if (field === 'done') {
    const completed = newState ? 1 : 0;
    const total = 1;
    return { completed, total, prog: newState ? 100 : 0 };
  }

  const nAssign =
    course.numAssign !== undefined
      ? course.numAssign
      : course.assignment1 !== undefined
      ? 2
      : 0;

  const nQuiz =
    course.numQuiz !== undefined
      ? course.numQuiz
      : course.quiz1 !== undefined
      ? 2
      : 0;

  const total = (nAssign + nQuiz) || course.tasks || 4;
  let completed = 0;

  for (let i = 1; i <= nAssign; i++) {
    const key = `assignment${i}`;
    const val = key === field ? newState : course[key];
    if (val) completed++;
  }
  for (let i = 1; i <= nQuiz; i++) {
    const key = `quiz${i}`;
    const val = key === field ? newState : course[key];
    if (val) completed++;
  }

  const prog = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, prog };
}
