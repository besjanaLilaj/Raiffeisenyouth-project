const colors = {
  red: '#cf030a',
  lavender: '#eae7fa',
  orange: '#ffeee0',
  blue: '#e4f0ff',
  mint: '#e1f4ec',
};

const budgets = [
  { id: 'food', name: 'Food & drinks', emoji: '🥗', spent: 6200, limit: 10000, color: '#7866d5', tint: colors.lavender },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️', spent: 4800, limit: 7000, color: '#e89053', tint: colors.orange },
  { id: 'transport', name: 'Transport', emoji: '🚌', spent: 2100, limit: 5000, color: '#4798d4', tint: colors.blue },
  { id: 'fun', name: 'Fun & going out', emoji: '🎟️', spent: 1500, limit: 4000, color: '#26a57b', tint: colors.mint },
];

const transactions = [
  { name: 'Mulliri i Vjetër', category: 'Coffee & snacks', emoji: '☕', amount: 350, time: 'Today, 10:42', color: colors.orange },
  { name: 'New Yorker', category: 'Shopping', emoji: '👕', amount: 2490, time: 'Today, 09:15', color: colors.lavender },
  { name: 'Urban Bus', category: 'Transport', emoji: '🚌', amount: 40, time: 'Yesterday, 17:30', color: colors.blue },
  { name: 'Big Market', category: 'Food & drinks', emoji: '🥑', amount: 1240, time: 'Yesterday, 13:05', color: colors.mint },
];

const state = {
  activeTab: 'home',
  period: 'month',
  showBalance: true,
  editingBudgetId: null,
};

const elements = {
  activitySection: document.querySelector('#activity-section'),
  activitySeeAll: document.querySelector('#activity-see-all'),
  budgetsList: document.querySelector('#budgets-list'),
  budgetsSection: document.querySelector('#budgets-section'),
  budgetsSeeAll: document.querySelector('#budgets-see-all'),
  budgetDialog: document.querySelector('#budget-dialog'),
  budgetForm: document.querySelector('#budget-form'),
  budgetPeriodLabel: document.querySelector('#budget-period-label'),
  cancelEdit: document.querySelector('#cancel-edit'),
  dialogDescription: document.querySelector('#dialog-description'),
  dialogTitle: document.querySelector('#dialog-title'),
  editHint: document.querySelector('#edit-hint'),
  formError: document.querySelector('#form-error'),
  limitInput: document.querySelector('#limit-input'),
  summaryLimit: document.querySelector('#summary-limit'),
  summaryProgress: document.querySelector('#summary-progress'),
  summaryRemaining: document.querySelector('#summary-remaining'),
  summarySpent: document.querySelector('#summary-spent'),
  tipCard: document.querySelector('#tip-card'),
  transactionsList: document.querySelector('#transactions-list'),
  visibilityButton: document.querySelector('#visibility-button'),
  visibilityIcon: document.querySelector('#visibility-icon'),
};

function formatLek(amount) {
  return `${Math.round(amount).toLocaleString('en-US')} ALL`;
}

function getDisplayedBudgets() {
  const factor = state.period === 'week' ? 0.25 : 1;
  return budgets.map((budget) => ({
    ...budget,
    spent: Math.round(budget.spent * factor),
    limit: Math.round(budget.limit * factor),
  }));
}

function makeProgressBar(spent, limit, color) {
  const track = document.createElement('span');
  track.className = 'progress-track';
  track.setAttribute('aria-label', `${Math.round((spent / Math.max(limit, 1)) * 100)}% of budget used`);

  const fill = document.createElement('span');
  fill.className = 'progress-fill';
  fill.style.width = `${Math.min(spent / Math.max(limit, 1), 1) * 100}%`;
  fill.style.backgroundColor = spent >= limit ? colors.red : color;
  track.append(fill);
  return track;
}

function renderSummary(displayedBudgets) {
  const totalSpent = displayedBudgets.reduce((total, budget) => total + budget.spent, 0);
  const totalLimit = displayedBudgets.reduce((total, budget) => total + budget.limit, 0);
  const remaining = totalLimit - totalSpent;
  elements.budgetPeriodLabel.textContent = state.period === 'week' ? 'Weekly budget' : 'Monthly budget';
  elements.summarySpent.textContent = state.showBalance ? formatLek(totalSpent) : '••••••••';
  elements.summaryLimit.textContent = formatLek(totalLimit);
  elements.summaryRemaining.textContent = state.showBalance ? formatLek(remaining) : '••••••';
  elements.summaryProgress.style.width = `${Math.min(totalSpent / Math.max(totalLimit, 1), 1) * 100}%`;
}

function renderBudgets(displayedBudgets) {
  const visibleBudgets = state.activeTab === 'home' ? displayedBudgets.slice(0, 3) : displayedBudgets;
  elements.budgetsList.replaceChildren();

  visibleBudgets.forEach((budget) => {
    const overLimit = budget.spent >= budget.limit;
    const row = document.createElement('button');
    row.className = 'budget-row';
    row.type = 'button';
    row.setAttribute('aria-label', `Edit ${budget.name} monthly budget`);
    row.addEventListener('click', () => openBudgetEditor(budget.id));

    const icon = document.createElement('span');
    icon.className = 'category-icon';
    icon.style.backgroundColor = budget.tint;
    icon.textContent = budget.emoji;

    const info = document.createElement('span');
    info.className = 'budget-info';
    const topline = document.createElement('span');
    topline.className = 'budget-topline';
    const name = document.createElement('span');
    name.className = 'budget-name';
    name.textContent = budget.name;
    const amount = document.createElement('span');
    amount.className = `budget-amount${overLimit ? ' over-limit' : ''}`;
    amount.textContent = formatLek(budget.spent);
    topline.append(name, amount);

    const bottomline = document.createElement('span');
    bottomline.className = 'budget-bottomline';
    const caption = document.createElement('span');
    caption.className = 'budget-caption';
    caption.textContent = overLimit ? 'Budget reached' : `${formatLek(budget.limit - budget.spent)} left`;
    const limit = document.createElement('span');
    limit.className = 'budget-caption';
    limit.textContent = `of ${formatLek(budget.limit)}`;
    bottomline.append(caption, limit);

    info.append(topline, makeProgressBar(budget.spent, budget.limit, budget.color), bottomline);
    row.append(icon, info);
    elements.budgetsList.append(row);
  });
}

function renderTransactions() {
  elements.transactionsList.replaceChildren();
  transactions.forEach((transaction) => {
    const row = document.createElement('div');
    row.className = 'transaction-row';
    const icon = document.createElement('span');
    icon.className = 'category-icon';
    icon.style.backgroundColor = transaction.color;
    icon.textContent = transaction.emoji;

    const info = document.createElement('span');
    info.className = 'transaction-info';
    const name = document.createElement('span');
    name.className = 'transaction-name';
    name.textContent = transaction.name;
    const meta = document.createElement('span');
    meta.className = 'transaction-meta';
    meta.textContent = `${transaction.category} · ${transaction.time}`;
    info.append(name, meta);

    const amount = document.createElement('span');
    amount.className = 'transaction-amount';
    amount.textContent = `−${formatLek(transaction.amount)}`;
    row.append(icon, info, amount);
    elements.transactionsList.append(row);
  });
}

function renderView() {
  const displayedBudgets = getDisplayedBudgets();
  renderSummary(displayedBudgets);
  renderBudgets(displayedBudgets);

  const isHome = state.activeTab === 'home';
  elements.budgetsSection.hidden = state.activeTab === 'activity';
  elements.activitySection.hidden = state.activeTab === 'budgets';
  elements.tipCard.hidden = !isHome;
  elements.editHint.hidden = state.activeTab !== 'budgets';
  elements.budgetsSeeAll.hidden = !isHome;
  elements.activitySeeAll.hidden = !isHome;
  document.querySelectorAll('.tab').forEach((tab) => {
    const selected = tab.dataset.tab === state.activeTab;
    tab.classList.toggle('selected', selected);
    tab.setAttribute('aria-selected', String(selected));
  });
  document.querySelectorAll('.period-option').forEach((option) => {
    const selected = option.dataset.period === state.period;
    option.classList.toggle('selected', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
}

function openBudgetEditor(id) {
  const budget = budgets.find((item) => item.id === id);
  if (!budget) return;

  state.editingBudgetId = id;
  elements.dialogTitle.textContent = `${budget.emoji} ${budget.name}`;
  elements.dialogDescription.textContent = `You’ve spent ${formatLek(budget.spent)} so far. Set a limit that works for you.`;
  elements.limitInput.value = String(budget.limit);
  elements.formError.textContent = '';
  elements.budgetDialog.showModal();
  elements.limitInput.focus();
}

function closeBudgetEditor() {
  elements.budgetDialog.close();
  state.editingBudgetId = null;
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    state.activeTab = tab.dataset.tab;
    renderView();
    document.querySelector('.page-content').scrollTo({ top: 0, behavior: 'smooth' });
  });
});

document.querySelectorAll('.period-option').forEach((option) => {
  option.addEventListener('click', () => {
    state.period = option.dataset.period;
    renderView();
  });
});

elements.visibilityButton.addEventListener('click', () => {
  state.showBalance = !state.showBalance;
  elements.visibilityButton.setAttribute('aria-label', state.showBalance ? 'Hide balances' : 'Show balances');
  elements.visibilityIcon.textContent = state.showBalance ? '◉' : '◎';
  renderView();
});

elements.budgetsSeeAll.addEventListener('click', () => {
  state.activeTab = 'budgets';
  renderView();
});

elements.activitySeeAll.addEventListener('click', () => {
  state.activeTab = 'activity';
  renderView();
});

elements.budgetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const newLimit = Number(elements.limitInput.value.trim());
  if (!Number.isFinite(newLimit) || newLimit <= 0) {
    elements.formError.textContent = 'Enter a budget greater than 0 ALL.';
    elements.limitInput.focus();
    return;
  }

  const budget = budgets.find((item) => item.id === state.editingBudgetId);
  if (!budget) return;
  budget.limit = newLimit;
  closeBudgetEditor();
  renderView();
});

elements.cancelEdit.addEventListener('click', closeBudgetEditor);
elements.budgetDialog.addEventListener('click', (event) => {
  if (event.target === elements.budgetDialog) closeBudgetEditor();
});
elements.limitInput.addEventListener('input', () => {
  elements.formError.textContent = '';
});

renderTransactions();
renderView();
