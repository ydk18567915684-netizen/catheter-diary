"use strict";

var STORAGE_KEY = "lanlan-catheter-diary-v1";

function $(sel) { return document.querySelector(sel); }

var els = {
  dateLine: $("#dateLine"),
  tabs: $("#tabs"),
  viewToday: $("#view-today"),
  viewHistory: $("#view-history"),
  countNum: $("#countNum"),
  countSub: $("#countSub"),
  addBtn: $("#addBtn"),
  undoBtn: $("#undoBtn"),
  statToday: $("#statToday"),
  statStreak: $("#statStreak"),
  monthLabel: $("#monthLabel"),
  prevMonth: $("#prevMonth"),
  nextMonth: $("#nextMonth"),
  calGrid: $("#calGrid"),
  dayDetail: $("#dayDetail")
};

var state = loadState();
var calCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function loadState() {
  var empty = { records: {} };
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    var data = JSON.parse(raw);
    return {
      records: data.records && typeof data.records === "object" ? data.records : {}
    };
  } catch (err) {
    return empty;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // 本地存储不可用时静默，页面仍可继续使用
  }
}

function pad2(n) { return String(n).padStart(2, "0"); }
function dateKey(d) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}
function todayKey() { return dateKey(new Date()); }
function parseKey(key) {
  var parts = key.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}
function countOf(key) {
  return state.records[key] || 0;
}
function todayCount() {
  return countOf(todayKey());
}
function esc(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function renderDateLine() {
  var d = new Date();
  els.dateLine.textContent = (d.getMonth() + 1) + "月" + d.getDate() + "日 · 星期" + "日一二三四五六".charAt(d.getDay());
}

function renderToday() {
  var n = todayCount();
  els.countNum.textContent = String(n);
  els.undoBtn.disabled = n === 0;
  els.countSub.textContent = n === 0 ? "导完一次就点一下“记录一次”" : "今天已记录 " + n + " 次，点错了可以撤销";
}

function addOnce() {
  var k = todayKey();
  state.records[k] = todayCount() + 1;
  saveState();
  renderToday();
}

function undoOnce() {
  var k = todayKey();
  var n = todayCount();
  if (n <= 1) {
    delete state.records[k];
  } else {
    state.records[k] = n - 1;
  }
  saveState();
  renderToday();
}

function renderHistory() {
  els.statToday.textContent = String(todayCount());
  els.statStreak.textContent = String(currentStreak());
  renderCalendar();
}

function currentStreak() {
  var cursor = new Date();
  cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
  if (countOf(dateKey(cursor)) === 0) {
    cursor.setDate(cursor.getDate() - 1);
  }
  var streak = 0;
  while (countOf(dateKey(cursor)) > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderCalendar() {
  var y = calCursor.getFullYear();
  var m = calCursor.getMonth();
  els.monthLabel.textContent = y + "年" + (m + 1) + "月";

  var first = new Date(y, m, 1);
  var offset = (first.getDay() + 6) % 7;
  var days = new Date(y, m + 1, 0).getDate();
  var todayStr = todayKey();
  var html = "";

  for (var i = 0; i < offset; i++) {
    html += '<span class="cal-cell cal-blank"></span>';
  }
  for (var day = 1; day <= days; day++) {
    var key = dateKey(new Date(y, m, day));
    var kind = countOf(key) > 0 ? "d-done" : "d-empty";
    var isToday = key === todayStr;
    html +=
      '<button type="button" class="cal-cell ' + kind + (isToday ? " is-today" : "") + '" data-key="' + key + '">' +
      "<span>" + day + "</span></button>";
  }
  els.calGrid.innerHTML = html;
  els.dayDetail.innerHTML = '<p class="dd-hint">点击日期查看当天的导管次数</p>';
}

function showDayDetail(key) {
  els.dayDetail.innerHTML = "";
  var d = parseKey(key);
  var head = document.createElement("div");
  head.className = "dd-head";
  head.textContent = (d.getMonth() + 1) + "月" + d.getDate() + "日 · 星期" + "日一二三四五六".charAt(d.getDay());
  els.dayDetail.appendChild(head);

  var n = countOf(key);
  if (n === 0) {
    var p = document.createElement("p");
    p.className = "dd-hint";
    p.textContent = "这一天没有导管记录";
    els.dayDetail.appendChild(p);
    return;
  }

  var row = document.createElement("div");
  row.className = "dd-item is-done";
  row.innerHTML =
    '<span class="dd-emoji">💧</span>' +
    '<span class="dd-name">导管</span>' +
    '<span class="dd-state">' + esc(n) + " 次</span>";
  els.dayDetail.appendChild(row);
}

function activateTab(name) {
  var tabs = els.tabs.querySelectorAll(".tab");
  Array.prototype.forEach.call(tabs, function (t) {
    t.classList.toggle("is-active", t.getAttribute("data-tab") === name);
  });
  els.viewToday.classList.toggle("is-hidden", name !== "today");
  els.viewHistory.classList.toggle("is-hidden", name !== "history");
  if (name === "history") renderHistory();
  else renderToday();
}

function bindEvents() {
  els.tabs.addEventListener("click", function (e) {
    var tab = e.target.closest(".tab");
    if (tab) activateTab(tab.getAttribute("data-tab"));
  });

  els.addBtn.addEventListener("click", addOnce);
  els.undoBtn.addEventListener("click", undoOnce);

  els.prevMonth.addEventListener("click", function () {
    calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() - 1, 1);
    renderCalendar();
  });
  els.nextMonth.addEventListener("click", function () {
    calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() + 1, 1);
    renderCalendar();
  });

  els.calGrid.addEventListener("click", function (e) {
    var cell = e.target.closest(".cal-cell[data-key]");
    if (cell) showDayDetail(cell.getAttribute("data-key"));
  });
}

function init() {
  renderDateLine();
  bindEvents();
  renderToday();
  renderCalendar();
}

init();
