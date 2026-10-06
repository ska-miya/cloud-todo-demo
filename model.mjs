export const STORAGE_KEY = 'dot-cloud-todo.v1';
export const MAX_TASK_LENGTH = 200;

export function cleanTaskText(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_TASK_LENGTH) : '';
}

export function parseTodos(raw) {
  if (raw === null) return [];
  const value = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error('Invalid saved tasks');
  const ids = new Set();
  return value.filter(task => {
    if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id) ||
        !cleanTaskText(task.text) || typeof task.done !== 'boolean') return false;
    ids.add(task.id);
    return true;
  }).map(({ id, text, done }) => ({ id, text: cleanTaskText(text), done }));
}
