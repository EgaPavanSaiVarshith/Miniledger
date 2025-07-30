// --- Client-side JS for Dashboard Page ---
document.addEventListener('DOMContentLoaded', function () {
  const expenseForm = document.getElementById('expense-form');
  const expenseList = document.getElementById('expense-list');
  const logoutBtn = document.getElementById('logout-btn');
  const totalSpentEl = document.getElementById('total-spent');
  const remainingAmountEl = document.getElementById('remaining-amount');
  const totalExpensesEl = document.getElementById('total-expenses');
  const categoriesUsedEl = document.getElementById('categories-used');
  const lastExpenseEl = document.getElementById('last-expense');
  const barChartEl = document.getElementById('barChart');
  const pieChartEl = document.getElementById('pieChart');

  // Set your total budget here (or fetch from backend/user profile)
  const TOTAL_BUDGET = 1000;

  let barChart, pieChart;

  async function fetchExpenses() {
    try {
      const res = await fetch('http://localhost:5000/api/expenses', { credentials: 'include' });
      if (!res.ok) throw new Error('Not logged in');
      const expenses = await res.json();
      renderExpenses(expenses);
      renderSummary(expenses);
      renderCharts(expenses);
    } catch (err) {
      if (window.location.pathname.endsWith('dashboard.html')) {
        window.location.href = 'login.html';
      }
    }
  }

  function renderExpenses(expenses) {
    if (!expenseList) return;
    if (!expenses.length) {
      expenseList.innerHTML = '<p>No expenses yet.</p>';
      return;
    }
    expenseList.innerHTML = expenses.map(e =>
      `<div class="expense-item" data-id="${e._id}"><strong>${e.category}</strong>: $${e.amount} - ${e.description || ''}
        <button class="delete-expense-btn">Delete</button>
      </div>`
    ).join('');

    // Delete expense
    document.querySelectorAll('.delete-expense-btn').forEach(btn => {
      btn.addEventListener('click', async function () {
        const item = btn.closest('.expense-item');
        const id = item.getAttribute('data-id');
        if (confirm('Delete this expense?')) {
          try {
            const res = await fetch(`http://localhost:5000/api/expenses/${id}`, {
              method: 'DELETE',
              credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to delete expense');
            fetchExpenses();
          } catch (err) {
            alert('Error deleting expense');
          }
        }
      });
    });
  }

  function renderSummary(expenses) {
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const remaining = TOTAL_BUDGET - totalSpent;
    if (totalSpentEl) totalSpentEl.textContent = `$${totalSpent}`;
    if (remainingAmountEl) remainingAmountEl.textContent = `$${remaining >= 0 ? remaining : 0}`;
    if (totalExpensesEl) totalExpensesEl.textContent = expenses.length;
    if (categoriesUsedEl) categoriesUsedEl.textContent = [...new Set(expenses.map(e => e.category))].length;
    if (lastExpenseEl) {
      if (expenses.length === 0) {
        lastExpenseEl.textContent = '-';
      } else {
        const last = expenses.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
        const d = new Date(last.createdAt);
        lastExpenseEl.textContent = d.toLocaleString();
      }
    }
  }

  function renderCharts(expenses) {
    // Bar chart: amount per category
    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });
    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    // Destroy previous charts if exist
    if (barChart) barChart.destroy();
    if (pieChart) pieChart.destroy();

    if (barChartEl) {
      barChart = new Chart(barChartEl, {
        type: 'bar',
        data: {
          labels: categories,
          datasets: [{
            label: 'Amount Spent',
            data: amounts,
            backgroundColor: '#007BFF',
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      });
    }
    if (pieChartEl) {
      pieChart = new Chart(pieChartEl, {
        type: 'pie',
        data: {
          labels: categories,
          datasets: [{
            data: amounts,
            backgroundColor: [
              '#007BFF', '#28A745', '#FFC107', '#DC3545', '#6F42C1', '#17A2B8', '#FD7E14'
            ]
          }]
        },
        options: { responsive: true }
      });
    }
  }

  if (expenseForm && expenseList) {
    fetchExpenses();
    expenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = document.getElementById('amount').value;
      const category = document.getElementById('category').value;
      const description = document.getElementById('description').value;
      try {
        const res = await fetch('http://localhost:5000/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ amount, category, description })
        });
        if (!res.ok) throw new Error('Failed to add expense');
        fetchExpenses();
        expenseForm.reset();
      } catch (err) {
        alert('Error adding expense');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('http://localhost:5000/api/logout', { credentials: 'include' });
      window.location.href = 'login.html';
    });
  }
});
