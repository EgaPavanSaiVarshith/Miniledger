require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');

// --- Client-side JS for MiniLedger ---
document.addEventListener('DOMContentLoaded', function () {
  // Login/Signup page logic
  const tabSignin = document.getElementById('tab-signin');
  const tabSignup = document.getElementById('tab-signup');
  const authForm = document.getElementById('auth-form');
  const authBtn = document.getElementById('auth-btn');
  const demoBtn = document.getElementById('demo-btn');
  const signupPassword2 = document.getElementById('signup-password2');

  if (tabSignin && tabSignup && authForm) {
    // Tab switching
    tabSignin.addEventListener('click', () => {
      tabSignin.classList.add('active');
      tabSignup.classList.remove('active');
      signupPassword2.style.display = 'none';
      authBtn.textContent = 'Sign In';
    });
    tabSignup.addEventListener('click', () => {
      tabSignup.classList.add('active');
      tabSignin.classList.remove('active');
      signupPassword2.style.display = 'block';
      authBtn.textContent = 'Sign Up';
    });

    // Auth form submit
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const isSignup = tabSignup.classList.contains('active');
      if (isSignup) {
        const password2 = signupPassword2.value;
        if (password !== password2) {
          alert('Passwords do not match!');
          return;
        }
      }
      const endpoint = isSignup ? '/api/signup' : '/api/signin';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          window.location.href = 'dashboard.html';
        } else {
          alert(data.message || 'Error');
        }
      } catch (err) {
        alert('Network error');
      }
    });

    // Demo button
    demoBtn.addEventListener('click', () => {
      document.getElementById('username').value = 'demo';
      document.getElementById('password').value = 'demo123';
      if (signupPassword2) signupPassword2.value = 'demo123';
    });
  }

  // Dashboard page logic
  const expenseForm = document.getElementById('expense-form');
  const expenseList = document.getElementById('expense-list');
  const logoutBtn = document.getElementById('logout-btn');

  async function fetchExpenses() {
    try {
      const res = await fetch('/api/expenses', { credentials: 'include' });
      if (!res.ok) throw new Error('Not logged in');
      const expenses = await res.json();
      renderExpenses(expenses);
    } catch (err) {
      if (window.location.pathname.endsWith('dashboard.html')) {
        window.location.href = 'logn.html';
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
      `<div class="expense-item"><strong>${e.category}</strong>: $${e.amount} - ${e.description || ''}</div>`
    ).join('');
  }

  if (expenseForm && expenseList) {
    fetchExpenses();
    expenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = document.getElementById('amount').value;
      const category = document.getElementById('category').value;
      const description = document.getElementById('description').value;
      try {
        const res = await fetch('/api/expenses', {
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
      await fetch('/api/logout', { credentials: 'include' });
      window.location.href = 'logn.html';
    });
  }
});
