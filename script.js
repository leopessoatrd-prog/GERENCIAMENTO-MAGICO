const state = {
  bankroll: 100,
  initialBankroll: 100,
  totalOperations: 7,
  targetWins: 2,
  odds: 2,
  wins: 0,
  losses: 0,
  stake: 0,
  active: false,
};

const els = {
  form: document.getElementById('configForm'),
  bankrollInput: document.getElementById('bankrollInput'),
  operationsInput: document.getElementById('operationsInput'),
  targetWinsInput: document.getElementById('targetWinsInput'),
  oddsInput: document.getElementById('oddsInput'),
  statusCard: document.getElementById('statusCard'),
  stats: document.getElementById('stats'),
  nextEntry: document.getElementById('nextEntry'),
  message: document.getElementById('message'),
  winBtn: document.getElementById('winBtn'),
  lossBtn: document.getElementById('lossBtn'),
  resetBtn: document.getElementById('resetBtn'),
};

function money(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calculateStake() {
  const operationsDone = state.wins + state.losses;
  const remaining = state.totalOperations - operationsDone;
  const winsNeeded = state.targetWins - state.wins;

  if (winsNeeded <= 0 || remaining <= 0 || winsNeeded > remaining) return 0;

  const lucroMeta = state.initialBankroll * 0.2;
  const lucroAtual = state.bankroll - state.initialBankroll;
  const lucroRestante = Math.max(lucroMeta - lucroAtual, 0);

  const riscoBase = state.bankroll / (remaining + 1);
  const tentativaMeta = lucroRestante / Math.max(winsNeeded, 1) / (state.odds - 1);

  const stake = Math.max(riscoBase, tentativaMeta);
  return Number(Math.min(stake, state.bankroll).toFixed(2));
}

function refresh() {
  const operationsDone = state.wins + state.losses;
  const remaining = state.totalOperations - operationsDone;
  const winsNeeded = state.targetWins - state.wins;

  state.stake = calculateStake();

  els.stats.innerHTML = `
    <div class="stat"><small>Banca atual</small><strong>${money(state.bankroll)}</strong></div>
    <div class="stat"><small>Wins</small><strong>${state.wins}</strong></div>
    <div class="stat"><small>Losses</small><strong>${state.losses}</strong></div>
    <div class="stat"><small>Operações restantes</small><strong>${remaining}</strong></div>
    <div class="stat"><small>Wins necessários</small><strong>${Math.max(winsNeeded, 0)}</strong></div>
  `;

  if (!state.active) {
    els.message.textContent = 'Configure e inicie um ciclo.';
    els.nextEntry.textContent = '';
    els.winBtn.disabled = true;
    els.lossBtn.disabled = true;
    return;
  }

  if (state.wins >= state.targetWins) {
    els.message.textContent = 'Meta de wins atingida. Ciclo concluído com sucesso!';
    els.nextEntry.textContent = 'Sem novas entradas sugeridas.';
    els.winBtn.disabled = true;
    els.lossBtn.disabled = true;
    return;
  }

  if (remaining === 0 || winsNeeded > remaining) {
    els.message.textContent = 'Ciclo encerrado: não há operações suficientes para bater a meta.';
    els.nextEntry.textContent = 'Sem novas entradas sugeridas.';
    els.winBtn.disabled = true;
    els.lossBtn.disabled = true;
    return;
  }

  els.message.textContent = 'Clique em WIN ou LOSS para registrar o resultado e receber a próxima entrada.';
  els.nextEntry.textContent = `Próxima entrada sugerida: ${money(state.stake)}`;
  els.winBtn.disabled = false;
  els.lossBtn.disabled = false;
}

function startCycle(event) {
  event.preventDefault();

  const bankroll = Number(els.bankrollInput.value);
  const totalOperations = Number(els.operationsInput.value);
  const targetWins = Number(els.targetWinsInput.value);
  const odds = Number(els.oddsInput.value);

  if (targetWins > totalOperations) {
    els.message.textContent = 'A meta de win não pode ser maior que o número de operações.';
    return;
  }

  state.initialBankroll = bankroll;
  state.bankroll = bankroll;
  state.totalOperations = totalOperations;
  state.targetWins = targetWins;
  state.odds = odds;
  state.wins = 0;
  state.losses = 0;
  state.active = true;

  els.statusCard.hidden = false;
  refresh();
}

function registerWin() {
  if (!state.active) return;
  state.bankroll = Number((state.bankroll + state.stake * (state.odds - 1)).toFixed(2));
  state.wins += 1;
  refresh();
}

function registerLoss() {
  if (!state.active) return;
  state.bankroll = Number((state.bankroll - state.stake).toFixed(2));
  state.losses += 1;
  refresh();
}

function resetCycle() {
  state.active = false;
  state.bankroll = state.initialBankroll;
  state.wins = 0;
  state.losses = 0;
  refresh();
}

els.form.addEventListener('submit', startCycle);
els.winBtn.addEventListener('click', registerWin);
els.lossBtn.addEventListener('click', registerLoss);
els.resetBtn.addEventListener('click', resetCycle);

refresh();
