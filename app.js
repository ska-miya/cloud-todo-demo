import { STORAGE_KEY, cleanTaskText, parseTodos } from './model.mjs';

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const error = document.querySelector('#input-error');
const storageError = document.querySelector('#storage-error');
const list = document.querySelector('#todo-list');
const emptyState = document.querySelector('#empty-state');
const summary = document.querySelector('#task-summary');
const announcement = document.querySelector('#announcement');
let todos = [];

function showStorageError(message) {
  storageError.textContent = message;
  storageError.hidden = false;
}

try {
  todos = parseTodos(localStorage.getItem(STORAGE_KEY));
} catch {
  showStorageError('保存したタスクを読み込めませんでした。このブラウザの保存設定をご確認ください。');
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    storageError.hidden = true;
  } catch {
    showStorageError('自動保存できませんでした。今のタスクは、このページを閉じると失われる可能性があります。');
  }
}

function render() {
  list.replaceChildren();
  emptyState.hidden = todos.length > 0;
  const done = todos.filter(task => task.done).length;
  summary.textContent = todos.length ? `残り ${todos.length - done} 件 ／ ${todos.length} 件` : '0 件';

  for (const task of todos) {
    const item = document.createElement('li');
    item.className = `todo-item${task.done ? ' is-done' : ''}`;
    const label = document.createElement('label');
    label.className = 'task-label';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.done;
    checkbox.dataset.taskId = task.id;
    const text = document.createElement('span');
    text.className = 'task-text';
    // Task text is always plain text, never HTML.
    text.textContent = task.text;
    label.append(checkbox, text);
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      save();
      render();
      [...list.querySelectorAll('.task-checkbox')].find(box => box.dataset.taskId === task.id)?.focus();
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-button';
    remove.setAttribute('aria-label', `「${task.text}」を削除`);
    remove.title = 'タスクを削除';
    remove.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/></svg>';
    remove.addEventListener('click', () => {
      const index = todos.indexOf(task);
      todos = todos.filter(candidate => candidate.id !== task.id);
      save();
      render();
      announcement.textContent = `「${task.text}」を削除しました。`;
      const nextCheckbox = list.querySelectorAll('.task-checkbox')[Math.min(index, todos.length - 1)];
      (nextCheckbox || input).focus();
    });
    item.append(label, remove);
    list.append(item);
  }
}

function clearInputError() {
  error.hidden = true;
  input.removeAttribute('aria-invalid');
}

input.addEventListener('input', clearInputError);
form.addEventListener('submit', event => {
  event.preventDefault();
  const text = cleanTaskText(input.value);
  if (!text) {
    error.textContent = 'タスクを入力してください。';
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    return;
  }
  todos.push({ id: crypto.randomUUID(), text, done: false });
  save();
  render();
  input.value = '';
  clearInputError();
  announcement.textContent = `「${text}」を追加しました。`;
  input.focus();
});

render();
