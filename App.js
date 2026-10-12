import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const colors = {
  background: '#F6F6F3',
  white: '#FFFFFF',
  navy: '#102345',
  muted: '#777F8D',
  red: '#E12636',
  green: '#15966A',
  line: '#E9EAE8',
  lavender: '#EAE7FA',
  orange: '#FFEEE0',
  blue: '#E4F0FF',
  mint: '#E1F4EC',
};

const initialBudgets = [
  { id: 'food', name: 'Food & drinks', emoji: '🥗', spent: 6200, limit: 10000, color: '#7866D5', tint: colors.lavender },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️', spent: 4800, limit: 7000, color: '#E89053', tint: colors.orange },
  { id: 'transport', name: 'Transport', emoji: '🚌', spent: 2100, limit: 5000, color: '#4798D4', tint: colors.blue },
  { id: 'fun', name: 'Fun & going out', emoji: '🎟️', spent: 1500, limit: 4000, color: '#26A57B', tint: colors.mint },
];

const transactions = [
  { name: 'Mulliri i Vjetër', category: 'Coffee & snacks', emoji: '☕', amount: 350, time: 'Today, 10:42', color: colors.orange },
  { name: 'New Yorker', category: 'Shopping', emoji: '👕', amount: 2490, time: 'Today, 09:15', color: colors.lavender },
  { name: 'Urban Bus', category: 'Transport', emoji: '🚌', amount: 40, time: 'Yesterday, 17:30', color: colors.blue },
  { name: 'Big Market', category: 'Food & drinks', emoji: '🥑', amount: 1240, time: 'Yesterday, 13:05', color: colors.mint },
];

const tabs = [
  { id: 'overview', label: 'Home', emoji: '⌂' },
  { id: 'activity', label: 'Activity', emoji: '↕' },
  { id: 'budgets', label: 'Budgets', emoji: '◎' },
];

function formatLek(amount) {
  return `${Math.round(amount).toLocaleString('en-US')} ALL`;
}

function ProgressBar({ spent, limit, color }) {
  const progress = Math.min(spent / Math.max(limit, 1), 1);

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

function SectionHeading({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.linkText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function App() {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('This month');
  const [showBalance, setShowBalance] = useState(true);
  const [editingBudget, setEditingBudget] = useState(null);
  const [limitInput, setLimitInput] = useState('');
  const [error, setError] = useState('');

  const periodFactor = period === 'This week' ? 0.25 : 1;
  const displayedBudgets = budgets.map((budget) => ({
    ...budget,
    spent: Math.round(budget.spent * periodFactor),
    limit: Math.round(budget.limit * periodFactor),
  }));
  const totalSpent = displayedBudgets.reduce((total, budget) => total + budget.spent, 0);
  const totalLimit = displayedBudgets.reduce((total, budget) => total + budget.limit, 0);
  const remaining = totalLimit - totalSpent;
  const selectedBudget = budgets.find((budget) => budget.id === editingBudget);

  function openBudgetEditor(id) {
    const budget = budgets.find((item) => item.id === id);
    setEditingBudget(id);
    setLimitInput(String(budget.limit));
    setError('');
  }

  function saveBudget() {
    const newLimit = Number(limitInput.trim());
    if (!Number.isFinite(newLimit) || newLimit <= 0) {
      setError('Enter a budget greater than 0 ALL.');
      return;
    }

    setBudgets((current) =>
      current.map((budget) => (budget.id === editingBudget ? { ...budget, limit: newLimit } : budget)),
    );
    setEditingBudget(null);
    setError('');
  }

  function renderBudget(budget, compact = false) {
    const isOverLimit = budget.spent >= budget.limit;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${budget.name} monthly budget`}
        key={budget.id}
        style={[styles.budgetRow, compact && styles.compactBudgetRow]}
        onPress={() => openBudgetEditor(budget.id)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: budget.tint }]}>
          <Text style={styles.categoryEmoji}>{budget.emoji}</Text>
        </View>
        <View style={styles.budgetInfo}>
          <View style={styles.budgetTopline}>
            <Text style={styles.budgetName}>{budget.name}</Text>
            <Text style={[styles.budgetAmount, isOverLimit && styles.overLimitText]}>
              {formatLek(budget.spent)}
            </Text>
          </View>
          <ProgressBar spent={budget.spent} limit={budget.limit} color={isOverLimit ? colors.red : budget.color} />
          <View style={styles.budgetBottomline}>
            <Text style={styles.budgetCaption}>
              {isOverLimit ? 'Budget reached' : `${formatLek(budget.limit - budget.spent)} left`}
            </Text>
            <Text style={styles.budgetCaption}>of {formatLek(budget.limit)}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  function renderTransaction(transaction, index) {
    return (
      <View style={[styles.transactionRow, index < transactions.length - 1 && styles.transactionDivider]} key={transaction.name}>
        <View style={[styles.categoryIcon, { backgroundColor: transaction.color }]}>
          <Text style={styles.categoryEmoji}>{transaction.emoji}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionName}>{transaction.name}</Text>
          <Text style={styles.transactionMeta}>{transaction.category} · {transaction.time}</Text>
        </View>
        <Text style={styles.transactionAmount}>−{formatLek(transaction.amount)}</Text>
      </View>
    );
  }

  const showAllBudgets = () => setActiveTab('budgets');
  const showAllActivity = () => setActiveTab('activity');
  const isOverview = activeTab === 'overview';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandMark}><Text style={styles.brandMarkText}>R</Text></View>
              <View>
                <Text style={styles.brandName}>raiffeisen</Text>
                <Text style={styles.brandSubname}>YOUTH</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showBalance ? 'Hide balances' : 'Show balances'}
              style={styles.notificationButton}
              onPress={() => setShowBalance((visible) => !visible)}
            >
              <Text style={styles.notificationIcon}>{showBalance ? '◉' : '◎'}</Text>
              <View style={styles.notificationDot} />
            </Pressable>
          </View>

          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Hey, Alex 👋</Text>
            <Text style={styles.greetingSubtext}>Here’s your money at a glance.</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryTopline}>
              <Text style={styles.summaryLabel}>YOU’VE SPENT</Text>
              <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>DEMO</Text></View>
            </View>
            <Text style={styles.summaryAmount}>
              {showBalance ? formatLek(totalSpent) : '••••••••'}
            </Text>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryBottom}>
              <View>
                <Text style={styles.summaryFootLabel}>{period === 'This week' ? 'Weekly budget' : 'Monthly budget'}</Text>
                <Text style={styles.summaryFootValue}>{formatLek(totalLimit)}</Text>
              </View>
              <View style={styles.summaryRight}>
                <Text style={styles.summaryFootLabel}>Still available</Text>
                <Text style={styles.remainingAmount}>{showBalance ? formatLek(remaining) : '••••••'}</Text>
              </View>
            </View>
            <ProgressBar spent={totalSpent} limit={totalLimit} color="#FF6370" />
            <Text style={styles.summaryHint}>Nice work — you’re within your budget!</Text>
          </View>

          <View style={styles.periodPicker}>
            {['This week', 'This month'].map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: period === option }}
                onPress={() => setPeriod(option)}
                style={[styles.periodOption, period === option && styles.periodOptionSelected]}
              >
                <Text style={[styles.periodText, period === option && styles.periodTextSelected]}>{option}</Text>
              </Pressable>
            ))}
          </View>

          {(isOverview || activeTab === 'budgets') && (
            <View>
              <SectionHeading title="Your budgets" action={isOverview ? 'See all' : undefined} onAction={showAllBudgets} />
              <View style={styles.card}>
                {(isOverview ? displayedBudgets.slice(0, 3) : displayedBudgets).map((budget) => renderBudget(budget))}
                {activeTab === 'budgets' ? (
                  <Text style={styles.editHint}>Tap a category to change its monthly limit.</Text>
                ) : null}
              </View>
            </View>
          )}

          {(isOverview || activeTab === 'activity') && (
            <View style={styles.transactionsSection}>
              <SectionHeading
                title="Recent activity"
                action={isOverview ? 'See all' : undefined}
                onAction={showAllActivity}
              />
              <View style={styles.card}>
                {transactions.map((transaction, index) => renderTransaction(transaction, index))}
              </View>
            </View>
          )}

          {isOverview ? (
            <View style={styles.tipCard}>
              <View style={styles.tipIcon}><Text style={styles.tipEmoji}>✨</Text></View>
              <View style={styles.tipCopy}>
                <Text style={styles.tipTitle}>Little spends add up!</Text>
                <Text style={styles.tipText}>Food & drinks is your top category this month. A coffee at home could save you 350 ALL.</Text>
              </View>
              <Text style={styles.tipArrow}>›</Text>
            </View>
          ) : null}

          <Text style={styles.disclaimer}>DEMO ONLY · Sample transactions and amounts · Not connected to a bank account</Text>
        </ScrollView>

        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                key={tab.id}
                style={styles.tab}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabIcon, isSelected && styles.tabIconSelected]}>{tab.emoji}</Text>
                <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Modal
          animationType="slide"
          transparent
          visible={Boolean(selectedBudget)}
          onRequestClose={() => setEditingBudget(null)}
        >
          <View style={styles.modalBackdrop}>
            <Pressable style={styles.modalDismissArea} onPress={() => setEditingBudget(null)} />
            <View style={styles.modalCard}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalEyebrow}>YOUR MONTHLY BUDGET</Text>
              <Text style={styles.modalTitle}>
                {selectedBudget ? `${selectedBudget.emoji} ${selectedBudget.name}` : 'Edit budget'}
              </Text>
              <Text style={styles.modalDescription}>
                You’ve spent {selectedBudget ? formatLek(selectedBudget.spent) : ''} so far. Set a limit that works for you.
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  accessibilityLabel="Monthly budget limit in ALL"
                  keyboardType="number-pad"
                  maxLength={9}
                  onChangeText={(value) => {
                    setLimitInput(value.replace(/[^0-9]/g, ''));
                    setError('');
                  }}
                  placeholder="e.g. 10000"
                  placeholderTextColor="#9A9EAA"
                  style={styles.limitInput}
                  value={limitInput}
                />
                <Text style={styles.inputCurrency}>ALL</Text>
              </View>
              {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
              <Pressable accessibilityRole="button" style={styles.saveButton} onPress={saveBudget}>
                <Text style={styles.saveButtonText}>Save new budget</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={styles.cancelButton} onPress={() => setEditingBudget(null)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  app: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 22, paddingBottom: 24 },
  header: { height: 62, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: colors.white, fontSize: 23, lineHeight: 27, fontWeight: '900' },
  brandName: { color: colors.navy, fontSize: 18, lineHeight: 20, letterSpacing: -0.8, fontWeight: '800' },
  brandSubname: { color: colors.red, fontSize: 9, fontWeight: '800', letterSpacing: 2.2 },
  notificationButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  notificationIcon: { fontSize: 21, color: colors.navy },
  notificationDot: { position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.red, borderWidth: 1, borderColor: colors.white },
  greeting: { marginTop: 12, marginBottom: 19 },
  greetingText: { color: colors.navy, fontSize: 24, fontWeight: '800', letterSpacing: -0.8 },
  greetingSubtext: { color: colors.muted, fontSize: 13, marginTop: 4 },
  summaryCard: { borderRadius: 22, padding: 20, backgroundColor: colors.navy },
  summaryTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: '#B8C5D8', fontSize: 10, letterSpacing: 1.4, fontWeight: '700' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#233957' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#58D5A5' },
  liveText: { color: '#DBE6F4', fontSize: 9, letterSpacing: 1, fontWeight: '800' },
  summaryAmount: { color: colors.white, fontSize: 31, fontWeight: '800', letterSpacing: -0.8, marginTop: 9 },
  summaryDivider: { height: 1, backgroundColor: '#32425B', marginVertical: 17 },
  summaryBottom: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  summaryRight: { alignItems: 'flex-end' },
  summaryFootLabel: { color: '#B8C5D8', fontSize: 11 },
  summaryFootValue: { color: colors.white, fontSize: 14, marginTop: 3, fontWeight: '700' },
  remainingAmount: { color: '#68DEB0', fontSize: 14, marginTop: 3, fontWeight: '700' },
  progressTrack: { width: '100%', height: 6, borderRadius: 4, backgroundColor: '#EDEEF0', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  summaryHint: { color: '#D5DFEB', fontSize: 11, marginTop: 9 },
  periodPicker: { alignSelf: 'flex-start', flexDirection: 'row', padding: 3, borderRadius: 10, backgroundColor: '#EAEAE7', marginTop: 19, marginBottom: 21 },
  periodOption: { minWidth: 85, alignItems: 'center', borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8 },
  periodOptionSelected: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  periodText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  periodTextSelected: { color: colors.navy, fontWeight: '700' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  sectionTitle: { color: colors.navy, fontSize: 17, letterSpacing: -0.3, fontWeight: '800' },
  linkText: { color: colors.red, fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: colors.white, borderRadius: 18, paddingHorizontal: 15, paddingVertical: 4 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  compactBudgetRow: { paddingVertical: 11 },
  categoryIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  categoryEmoji: { fontSize: 19 },
  budgetInfo: { flex: 1 },
  budgetTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  budgetName: { color: colors.navy, fontSize: 12, fontWeight: '700' },
  budgetAmount: { color: colors.navy, fontSize: 11, fontWeight: '700' },
  overLimitText: { color: colors.red },
  budgetBottomline: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  budgetCaption: { color: colors.muted, fontSize: 10 },
  transactionsSection: { marginTop: 21 },
  transactionRow: { minHeight: 67, flexDirection: 'row', alignItems: 'center', gap: 11 },
  transactionDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  transactionInfo: { flex: 1 },
  transactionName: { color: colors.navy, fontSize: 12, fontWeight: '700' },
  transactionMeta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  transactionAmount: { color: colors.navy, fontSize: 11, fontWeight: '700' },
  tipCard: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#FFF7DF', borderRadius: 16, padding: 14, marginTop: 19 },
  tipIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#FFEDB5', justifyContent: 'center', alignItems: 'center' },
  tipEmoji: { fontSize: 17 },
  tipCopy: { flex: 1 },
  tipTitle: { color: colors.navy, fontSize: 12, fontWeight: '800' },
  tipText: { color: '#666C75', fontSize: 10, lineHeight: 15, marginTop: 3 },
  tipArrow: { color: '#9E8850', fontSize: 24 },
  editHint: { color: colors.muted, fontSize: 10, textAlign: 'center', paddingTop: 10, paddingBottom: 13 },
  disclaimer: { color: '#999DA4', fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 18, marginBottom: 4 },
  tabBar: { height: 67, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: colors.white, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line, paddingHorizontal: 12 },
  tab: { minWidth: 70, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabIcon: { color: '#989EAA', fontSize: 21, lineHeight: 23 },
  tabIconSelected: { color: colors.red },
  tabLabel: { color: '#989EAA', fontSize: 9, fontWeight: '600' },
  tabLabelSelected: { color: colors.red, fontWeight: '800' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(12, 22, 39, 0.46)' },
  modalDismissArea: { flex: 1 },
  modalCard: { backgroundColor: colors.white, borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingTop: 11, paddingBottom: 32, paddingHorizontal: 23 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: '#DADCE1', marginBottom: 21 },
  modalEyebrow: { color: colors.muted, fontSize: 10, letterSpacing: 1.1, fontWeight: '800' },
  modalTitle: { color: colors.navy, fontSize: 23, fontWeight: '800', marginTop: 8 },
  modalDescription: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  inputContainer: { height: 54, flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E0E2E5', paddingHorizontal: 15, marginTop: 20 },
  limitInput: { flex: 1, height: '100%', color: colors.navy, fontSize: 16, fontWeight: '700' },
  inputCurrency: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  errorText: { color: colors.red, fontSize: 11, marginTop: 8 },
  saveButton: { height: 51, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.red, marginTop: 17 },
  saveButtonText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  cancelButton: { height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  cancelButtonText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
});
