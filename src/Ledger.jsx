import { useState, useEffect, useCallback, useRef } from "react";

const uid = () => Math.random().toString(36).slice(2, 10);

// Converts Arabic-Indic (٠-٩) and Extended Arabic-Indic/Persian (۰-۹) digits,
// plus Arabic decimal/thousands separators, to plain English digits/punctuation.
function toEnglishDigits(str) {
  if (!str) return str;
  const map = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "٫": ".", "،": ",",
  };
  return String(str).replace(/[٠-٩۰-۹٫،]/g, (d) => map[d]);
}

function money(n) {
  const v = Number(n) || 0;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function grams(n) {
  const v = Number(n) || 0;
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} g`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(dateStr) {
  return (dateStr || todayStr()).slice(0, 7); // "YYYY-MM"
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

// For each month that has activity, works out what was still owed coming
// into that month (from all prior entries) and how much was paid back
// during that same month — so you can see whether a month's opening debt
// got cleared within the 4-week window.
function buildMonthlyReview(entries) {
  if (!entries || entries.length === 0) return [];
  const sorted = [...entries].slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const months = [];
  const seen = new Set();
  sorted.forEach((e) => {
    const key = monthKey(e.date);
    if (!seen.has(key)) {
      seen.add(key);
      months.push(key);
    }
  });
  months.sort();
  const rows = months.map((key) => {
    const monthStart = key + "-01";
    const carriedIn = sorted.filter((e) => monthKey(e.date) < key).reduce((s, e) => s + e.amount, 0);
    const onFirstDay = sorted.filter((e) => e.date === monthStart).reduce((s, e) => s + e.amount, 0);
    const owedAtStart = Math.max(carriedIn + onFirstDay, 0);
    const takenLaterThisMonth = sorted
      .filter((e) => monthKey(e.date) === key && e.date !== monthStart && e.amount > 0)
      .reduce((s, e) => s + e.amount, 0);
    const paidThisMonth = sorted
      .filter((e) => monthKey(e.date) === key && e.amount < 0)
      .reduce((s, e) => s + Math.abs(e.amount), 0);
    const late = owedAtStart > 0 && paidThisMonth < owedAtStart;
    return { key, owedAtStart, paidThisMonth, takenLaterThisMonth, late };
  });
  return rows.reverse(); // newest month first
}

const emptyLedger = () => ({ gold: [], wages: [], prices: {} });

// Fetches a single client's ledger from storage, defaulting to empty on
// any error (missing key, parse failure, etc).
async function fetchLedgerFor(customerId) {
  try {
    const res = await window.storage.get("ledger:" + customerId, false);
    return res ? { ...emptyLedger(), ...JSON.parse(res.value) } : emptyLedger();
  } catch (e) {
    return emptyLedger();
  }
}

// Fetches every listed customer's ledger concurrently (instead of one
// request at a time) — this is what makes Backup and the cross-client
// Review screens load in roughly one round-trip instead of N.
async function fetchAllLedgers(customers) {
  const pairs = await Promise.all(
    (customers || []).map(async (c) => [c.id, await fetchLedgerFor(c.id)])
  );
  return Object.fromEntries(pairs);
}

// Entries created before/without the "books" feature (or via the normal
// add-entry flow) have no `book` field and count as the ongoing "current"
// book. Entries imported from an archive (e.g. a past year) carry an
// explicit book id like "2025". Headline balances only reflect "current" —
// archived books are reference data you view separately.
function distinctBooks(entries) {
  const set = new Set();
  (entries || []).forEach((e) => {
    if (e.book) set.add(e.book);
  });
  return Array.from(set).sort();
}

function entriesForBook(entries, book) {
  return (entries || []).filter((e) => (book === "current" ? !e.book : e.book === book));
}

function ClientsTab() {
  const [customers, setCustomers] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [ledgers, setLedgers] = useState({});
  const [screen, setScreen] = useState("list");
  const [detailTab, setDetailTab] = useState("gold");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [addError, setAddError] = useState("");
  const [entryForm, setEntryForm] = useState({ open: null, direction: "take", amount: "", date: todayStr(), note: "", error: "", editId: null });
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryDraftName, setCategoryDraftName] = useState("");
  const [categoryEditError, setCategoryEditError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("customers-list", false);
        setCustomers(res ? JSON.parse(res.value) : []);
      } catch (e) {
        setCustomers([]);
      }
      try {
        const res = await window.storage.get("categories-list", false);
        setCategories(res ? JSON.parse(res.value) : []);
      } catch (e) {
        setCategories([]);
      }
      setLoading(false);
    })();
  }, []);

  const saveCustomers = useCallback(async (list) => {
    setCustomers(list);
    try {
      await window.storage.set("customers-list", JSON.stringify(list), false);
    } catch (e) {
      console.error("save customers failed", e);
    }
  }, []);

  const saveCategories = useCallback(async (list) => {
    setCategories(list);
    try {
      await window.storage.set("categories-list", JSON.stringify(list), false);
    } catch (e) {
      console.error("save categories failed", e);
    }
  }, []);

  const loadLedger = useCallback(async (customerId) => {
    if (ledgers[customerId]) return ledgers[customerId];
    let data = emptyLedger();
    try {
      const res = await window.storage.get("ledger:" + customerId, false);
      if (res) data = { ...emptyLedger(), ...JSON.parse(res.value) };
    } catch (e) {
      // no ledger yet
    }
    setLedgers((prev) => ({ ...prev, [customerId]: data }));
    return data;
  }, [ledgers]);

  const saveLedger = useCallback(async (customerId, data) => {
    setLedgers((prev) => ({ ...prev, [customerId]: data }));
    try {
      await window.storage.set("ledger:" + customerId, JSON.stringify(data), false);
    } catch (e) {
      console.error("save ledger failed", e);
    }
  }, []);

  function openCustomer(id) {
    setActiveId(id);
    setScreen("detail");
    setDetailTab("gold");
    loadLedger(id);
  }

  async function handleAddCustomer() {
    const name = newName.trim();
    if (!name) {
      setAddError("Enter a client name");
      return;
    }
    const c = { id: uid(), name, phone: newPhone.trim() };
    await saveCustomers([c, ...(customers || [])]);
    setNewName("");
    setNewPhone("");
    setAddError("");
    openCustomer(c.id);
  }

  function startEntry(kind, book) {
    setEntryForm({ open: kind, direction: "take", amount: "", date: todayStr(), note: "", error: "", editId: null, book: book && book !== "current" ? book : null });
  }

  function editEntry(kind, entry) {
    setEntryForm({
      open: kind,
      direction: entry.amount > 0 ? "take" : "return",
      amount: String(Math.abs(entry.amount)),
      date: entry.date || todayStr(),
      note: entry.note || "",
      error: "",
      editId: entry.id,
      book: entry.book || null,
    });
  }

  async function submitEntry() {
    const amt = parseFloat(toEnglishDigits(entryForm.amount));
    if (isNaN(amt) || amt <= 0) {
      setEntryForm((f) => ({ ...f, error: "Enter a valid amount" }));
      return;
    }
    const current = ledgers[activeId] || emptyLedger();
    const next = { ...current };
    const signedAmount = entryForm.direction === "take" ? amt : -amt;
    const listKey = entryForm.open === "gold" ? "gold" : "wages";
    if (entryForm.editId) {
      next[listKey] = current[listKey].map((e) =>
        e.id === entryForm.editId
          ? { ...e, amount: signedAmount, date: entryForm.date || todayStr(), note: entryForm.note.trim() }
          : e
      );
    } else {
      const record = {
        id: uid(),
        amount: signedAmount,
        date: entryForm.date || todayStr(),
        note: entryForm.note.trim(),
        ...(entryForm.book ? { book: entryForm.book } : {}),
      };
      next[listKey] = [record, ...current[listKey]];
    }
    await saveLedger(activeId, next);
    setEntryForm({ open: null, direction: "take", amount: "", date: todayStr(), note: "", error: "", editId: null, book: null });
  }

  async function deleteEntry(kind, id) {
    const current = ledgers[activeId] || emptyLedger();
    const next = { ...current };
    next[kind] = current[kind].filter((p) => p.id !== id);
    await saveLedger(activeId, next);
  }

  async function deleteCustomer(id) {
    const list = (customers || []).filter((c) => c.id !== id);
    await saveCustomers(list);
    if (activeId === id) {
      setActiveId(null);
      setScreen("list");
    }
  }

  async function renameCustomer(id, name) {
    const list = (customers || []).map((c) => (c.id === id ? { ...c, name } : c));
    await saveCustomers(list);
  }

  async function updateCustomerContact(id, { phone, address }) {
    const list = (customers || []).map((c) => (c.id === id ? { ...c, phone, address } : c));
    await saveCustomers(list);
  }

  async function setClientPrice(categoryId, value) {
    const current = ledgers[activeId] || emptyLedger();
    const next = { ...current, prices: { ...current.prices } };
    if (value === "" || value === null) {
      delete next.prices[categoryId];
    } else {
      next.prices[categoryId] = value;
    }
    await saveLedger(activeId, next);
  }

  async function addCategory() {
    const name = newCategory.trim();
    if (!name) {
      setCategoryError("Enter a category name");
      return;
    }
    await saveCategories([...(categories || []), { id: uid(), name }]);
    setNewCategory("");
    setCategoryError("");
  }

  async function deleteCategory(id) {
    await saveCategories((categories || []).filter((c) => c.id !== id));
    if (editingCategoryId === id) {
      setEditingCategoryId(null);
      setCategoryDraftName("");
    }
  }

  function startEditCategory(cat) {
    setEditingCategoryId(cat.id);
    setCategoryDraftName(cat.name);
    setCategoryEditError("");
  }

  function cancelEditCategory() {
    setEditingCategoryId(null);
    setCategoryDraftName("");
    setCategoryEditError("");
  }

  async function saveEditCategory() {
    const name = categoryDraftName.trim();
    if (!name) {
      setCategoryEditError("Enter a category name");
      return;
    }
    await saveCategories((categories || []).map((c) => (c.id === editingCategoryId ? { ...c, name } : c)));
    setEditingCategoryId(null);
    setCategoryDraftName("");
    setCategoryEditError("");
  }

  function balancesFor(id) {
    const l = ledgers[id];
    if (!l) return null;
    const gold = entriesForBook(l.gold, "current").reduce((s, e) => s + e.amount, 0);
    const wages = entriesForBook(l.wages, "current").reduce((s, e) => s + e.amount, 0);
    return { gold, wages };
  }

  // Sums every entry across every book (current + 2025 + 2026 + any future
  // books) — used on the client list so the headline figure reflects the
  // client's true total, not just the current/open book.
  function totalBalancesFor(id) {
    const l = ledgers[id];
    if (!l) return null;
    const gold = (l.gold || []).reduce((s, e) => s + e.amount, 0);
    const wages = (l.wages || []).reduce((s, e) => s + e.amount, 0);
    return { gold, wages };
  }

  async function addBook(kind, bookId) {
    const current = ledgers[activeId] || emptyLedger();
    const extra = (current.extraBooks && current.extraBooks[kind]) || [];
    if (extra.includes(bookId) || bookId === "current") return;
    const next = {
      ...current,
      extraBooks: {
        gold: (current.extraBooks && current.extraBooks.gold) || [],
        wages: (current.extraBooks && current.extraBooks.wages) || [],
        [kind]: [...extra, bookId],
      },
    };
    await saveLedger(activeId, next);
  }

  async function deleteBook(kind, bookId) {
    const current = ledgers[activeId] || emptyLedger();
    const extra = (current.extraBooks && current.extraBooks[kind]) || [];
    const next = {
      ...current,
      [kind]: (current[kind] || []).filter((e) => e.book !== bookId),
      extraBooks: {
        gold: (current.extraBooks && current.extraBooks.gold) || [],
        wages: (current.extraBooks && current.extraBooks.wages) || [],
        [kind]: extra.filter((b) => b !== bookId),
      },
    };
    await saveLedger(activeId, next);
  }

  async function buildBackupData() {
    const list = customers || [];
    const uncached = list.filter((c) => !ledgers[c.id]);
    const fetched = await fetchAllLedgers(uncached);
    const allLedgers = {};
    for (const c of list) {
      allLedgers[c.id] = ledgers[c.id] || fetched[c.id] || emptyLedger();
    }
    return JSON.stringify(
      { customers: list, categories: categories || [], ledgers: allLedgers },
      null,
      2
    );
  }

  async function restoreFromBackup(jsonText) {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== "object") throw new Error("Invalid backup");
    const restoredCustomers = Array.isArray(parsed.customers) ? parsed.customers : [];
    const restoredCategories = Array.isArray(parsed.categories) ? parsed.categories : [];
    const restoredLedgers = parsed.ledgers && typeof parsed.ledgers === "object" ? parsed.ledgers : {};
    await saveCustomers(restoredCustomers);
    await saveCategories(restoredCategories);
    for (const id of Object.keys(restoredLedgers)) {
      await saveLedger(id, { ...emptyLedger(), ...restoredLedgers[id] });
    }
  }

  async function cleanupOldDailyBackups(keep = 14) {
    try {
      const res = await window.storage.list("daily-backup:", false);
      const keys = ((res && res.keys) || []).slice().sort();
      const toDelete = keys.slice(0, Math.max(0, keys.length - keep));
      for (const k of toDelete) {
        try {
          await window.storage.delete(k, false);
        } catch (e) {
          // ignore individual delete failures
        }
      }
    } catch (e) {
      // listing not available; skip cleanup
    }
  }

  async function runDailyBackupIfNeeded() {
    const today = todayStr();
    try {
      const last = await window.storage.get("last-daily-backup", false);
      if (last && last.value === today) return;
    } catch (e) {
      // no record yet, proceed to create one
    }
    try {
      const data = await buildBackupData();
      await window.storage.set("daily-backup:" + today, data, false);
      await window.storage.set("last-daily-backup", today, false);
      await cleanupOldDailyBackups(14);
    } catch (e) {
      console.error("daily backup failed", e);
    }
  }

  async function listDailyBackups() {
    try {
      const res = await window.storage.list("daily-backup:", false);
      const keys = ((res && res.keys) || []).slice().sort().reverse();
      return keys.map((k) => k.replace("daily-backup:", ""));
    } catch (e) {
      return [];
    }
  }

  async function getDailyBackup(dateStr) {
    const res = await window.storage.get("daily-backup:" + dateStr, false);
    return res ? res.value : null;
  }

  const autoBackupRanRef = useRef(false);
  useEffect(() => {
    if (loading || autoBackupRanRef.current || customers === null) return;
    autoBackupRanRef.current = true;
    runDailyBackupIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, customers]);

  useEffect(() => {
    if (customers && customers.length && screen === "list") {
      customers.forEach((c) => {
        if (!ledgers[c.id]) loadLedger(c.id);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, screen]);

  const fontLink = (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap"
    />
  );

  const styles = {
    wrap: {
      fontFamily: "'Inter', sans-serif",
      color: "#F3EEE3",
      maxWidth: 480,
      margin: "0 auto",
      padding: "1.5rem 1rem 3rem",
    },
    display: { fontFamily: "'Fraunces', serif" },
  };

  if (loading) {
    return (
      <div style={{ ...styles.wrap, textAlign: "center", paddingTop: "3rem" }}>
        {fontLink}
        <span style={{ color: "#8B7355" }}>Loading ledger…</span>
      </div>
    );
  }

  const active = (customers || []).find((c) => c.id === activeId);

  return (
    <div style={styles.wrap}>
      {fontLink}
      <h2 className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
        Client ledger for tracking gold, wages, and jewelry price lists
      </h2>

      {screen === "list" && (
        <ListScreen
          customers={customers || []}
          ledgers={ledgers}
          balancesFor={totalBalancesFor}
          onOpen={openCustomer}
          newName={newName}
          setNewName={setNewName}
          newPhone={newPhone}
          setNewPhone={setNewPhone}
          addError={addError}
          onAdd={handleAddCustomer}
          onManageCategories={() => setScreen("categories")}
          onBackup={() => setScreen("backup")}
          styles={styles}
        />
      )}

      {screen === "categories" && (
        <CategoriesScreen
          categories={categories || []}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          categoryError={categoryError}
          onAdd={addCategory}
          onDelete={deleteCategory}
          onBack={() => setScreen("list")}
          editingCategoryId={editingCategoryId}
          categoryDraftName={categoryDraftName}
          setCategoryDraftName={setCategoryDraftName}
          categoryEditError={categoryEditError}
          onStartEdit={startEditCategory}
          onCancelEdit={cancelEditCategory}
          onSaveEdit={saveEditCategory}
          styles={styles}
        />
      )}

      {screen === "backup" && (
        <BackupScreen
          onBack={() => setScreen("list")}
          buildBackupData={buildBackupData}
          restoreFromBackup={restoreFromBackup}
          listDailyBackups={listDailyBackups}
          getDailyBackup={getDailyBackup}
          styles={styles}
        />
      )}

      {screen === "detail" && active && (
        <DetailScreen
          customer={active}
          ledger={ledgers[active.id] || emptyLedger()}
          balances={totalBalancesFor(active.id) || { gold: 0, wages: 0 }}
          categories={categories || []}
          tab={detailTab}
          setTab={setDetailTab}
          onBack={() => setScreen("list")}
          entryForm={entryForm}
          setEntryForm={setEntryForm}
          startEntry={startEntry}
          editEntry={editEntry}
          submitEntry={submitEntry}
          deleteEntry={deleteEntry}
          onDeleteCustomer={() => deleteCustomer(active.id)}
          onRenameCustomer={(name) => renameCustomer(active.id, name)}
          onUpdateContact={(patch) => updateCustomerContact(active.id, patch)}
          setClientPrice={setClientPrice}
          onManageCategories={() => setScreen("categories")}
          onAddBook={(kind, bookId) => addBook(kind, bookId)}
          onDeleteBook={(kind, bookId) => deleteBook(kind, bookId)}
          styles={styles}
        />
      )}
    </div>
  );
}

function ListScreen({ customers, ledgers, balancesFor, onOpen, newName, setNewName, newPhone, setNewPhone, addError, onAdd, onManageCategories, onBackup, styles }) {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const filteredCustomers = search.trim()
    ? customers.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))
    : customers;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 0.3, color: "#8B7355", marginBottom: 2 }}>Client ledger</div>
          <h1 style={{ ...styles.display, fontSize: 28, fontWeight: 600, margin: 0, color: "#F3EEE3" }}>Your clients</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBackup} style={smallBtn}>
            Backup
          </button>
          <button onClick={onManageCategories} style={smallBtn}>
            Categories
          </button>
        </div>
      </div>

      {showAddForm ? (
        <div
          style={{
            background: "#232019",
            border: "1px solid #3A3527",
            borderRadius: 12,
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, color: "#C9A227" }}>Add a client</div>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Client name"
            style={inputStyle}
            autoFocus
          />
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Phone (optional)"
            style={{ ...inputStyle, marginTop: 8 }}
          />
          {addError && <div style={{ color: "#D4756B", fontSize: 13, marginTop: 6 }}>{addError}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={onAdd} style={{ ...primaryBtn, flex: 1 }}>
              Add client
            </button>
            <button onClick={() => setShowAddForm(false)} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)} style={{ ...primaryBtn, width: "100%", marginBottom: "1.5rem" }}>
          + Add new client
        </button>
      )}

      {customers.length > 0 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients"
          style={{ ...inputStyle, marginBottom: 12 }}
        />
      )}

      {customers.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          No clients yet. Add your first one above.
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          No clients match "{search.trim()}".
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredCustomers.map((c) => {
            const bal = balancesFor(c.id);
            return (
              <button
                key={c.id}
                onClick={() => onOpen(c.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  textAlign: "left",
                  background: "#1C1913",
                  border: "1px solid #3A3527",
                  borderRadius: 10,
                  padding: "0.85rem 1rem",
                  color: "#F3EEE3",
                  cursor: "pointer",
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div>
                  {c.phone && <div style={{ fontSize: 12, color: "#8B7355", marginTop: 2 }}>{c.phone}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  {bal === null ? (
                    <span style={{ fontSize: 12, color: "#8B7355" }}>…</span>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 500, color: bal.gold > 0 ? "#D4756B" : bal.gold < 0 ? "#7FAE7A" : "#8B7355" }}>
                        Gold {grams(bal.gold)}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: bal.wages > 0 ? "#D4756B" : bal.wages < 0 ? "#7FAE7A" : "#8B7355" }}>
                        Wages {money(bal.wages)}
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BackupScreen({ onBack, buildBackupData, restoreFromBackup, listDailyBackups, getDailyBackup, styles }) {
  const [exportText, setExportText] = useState("");
  const [exportLoading, setExportLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState("");
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [confirmingImport, setConfirmingImport] = useState(false);
  const [dailyBackups, setDailyBackups] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [confirmingDaily, setConfirmingDaily] = useState(null);
  const [dailyStatus, setDailyStatus] = useState("");
  const fileInputRef = useRef(null);

  function handleDownload() {
    const blob = new Blob([exportText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modern-gold-backup-" + todayStr() + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleUploadClick() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  function handleFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImportText(String(reader.result || ""));
      setImportStatus("");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  useEffect(() => {
    let cancelled = false;
    setExportLoading(true);
    buildBackupData().then((text) => {
      if (!cancelled) {
        setExportText(text);
        setExportLoading(false);
      }
    });
    setDailyLoading(true);
    listDailyBackups().then((dates) => {
      if (!cancelled) {
        setDailyBackups(dates);
        setDailyLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRestoreDaily(dateStr) {
    setDailyStatus("");
    try {
      const text = await getDailyBackup(dateStr);
      if (!text) throw new Error("missing");
      await restoreFromBackup(text);
      setDailyStatus("Restored " + dateStr + " successfully");
      setConfirmingDaily(null);
    } catch (e) {
      setDailyStatus("Couldn't restore that backup — nothing was changed");
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyStatus("Copied");
    } catch (e) {
      setCopyStatus("Couldn't copy — select and copy manually");
    }
    setTimeout(() => setCopyStatus(""), 2500);
  }

  async function handleRestore() {
    setImportStatus("");
    try {
      await restoreFromBackup(importText);
      setImportStatus("Restored successfully");
      setConfirmingImport(false);
    } catch (e) {
      setImportStatus("That didn't look like a valid backup — nothing was changed");
    }
  }

  return (
    <div>
      <button onClick={onBack} style={backBtn}>
        All clients
      </button>

      <h1 style={{ ...styles.display, fontSize: 24, fontWeight: 600, margin: "0 0 1rem", color: "#F3EEE3" }}>Backup & restore</h1>

      <div style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 12, padding: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: "#C9A227" }}>Export your data</div>
        <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 10 }}>
          Copy this and save it somewhere safe (Notes, email to yourself, etc.). Paste it back in below any time you need to restore it — for example, after I send you an updated version of this app.
        </div>
        {exportLoading ? (
          <div style={{ color: "#8B7355", fontSize: 13 }}>Preparing backup…</div>
        ) : (
          <>
            <textarea
              readOnly
              value={exportText}
              onFocus={(e) => e.target.select()}
              style={{ ...inputStyle, height: 160, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
            />
            <button onClick={handleCopy} style={{ ...primaryBtn, marginTop: 10, width: "100%" }}>
              {copyStatus || "Copy backup"}
            </button>
            <button onClick={handleDownload} style={{ ...smallBtn, marginTop: 8, width: "100%", textAlign: "center" }}>
              Save to file
            </button>
          </>
        )}
      </div>

      <div style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 12, padding: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: "#C9A227" }}>Daily backups</div>
        <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 10 }}>
          A snapshot is saved automatically once a day when you open the app. If something ever goes wrong, restore the most recent good one below.
        </div>
        {dailyLoading ? (
          <div style={{ color: "#8B7355", fontSize: 13 }}>Loading…</div>
        ) : dailyBackups.length === 0 ? (
          <div style={{ color: "#8B7355", fontSize: 13 }}>No automatic backups yet — one will be created next time you open the app.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {dailyBackups.map((dateStr) =>
              confirmingDaily === dateStr ? (
                <div key={dateStr} style={{ background: "#1C1913", border: "1px solid #D4756B", borderRadius: 8, padding: "0.6rem 0.75rem" }}>
                  <div style={{ fontSize: 13, color: "#D4756B", marginBottom: 8 }}>
                    Restore the {dateStr} backup? This overwrites everything currently in the app.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleRestoreDaily(dateStr)} style={{ ...primaryBtn, background: "#D4756B", color: "#1C1913", flex: 1 }}>
                      Yes, restore
                    </button>
                    <button onClick={() => setConfirmingDaily(null)} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={dateStr}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#1C1913",
                    border: "1px solid #3A3527",
                    borderRadius: 8,
                    padding: "0.6rem 0.75rem",
                  }}
                >
                  <div style={{ fontSize: 14, color: "#F3EEE3" }}>{dateStr}</div>
                  <button onClick={() => setConfirmingDaily(dateStr)} style={smallBtn}>
                    Restore
                  </button>
                </div>
              )
            )}
          </div>
        )}
        {dailyStatus && (
          <div style={{ fontSize: 13, color: dailyStatus.startsWith("Restored") ? "#7FAE7A" : "#D4756B", marginTop: 10 }}>
            {dailyStatus}
          </div>
        )}
      </div>

      <div style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 12, padding: "1rem" }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: "#C9A227" }}>Restore from backup</div>
        <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 10 }}>
          Paste a previously copied backup here, or upload a saved backup file. This replaces everything currently in the app.
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt,application/json,text/plain"
          onChange={handleFileSelected}
          style={{ display: "none" }}
        />
        <button onClick={handleUploadClick} style={{ ...smallBtn, width: "100%", textAlign: "center", marginBottom: 10 }}>
          Upload backup file
        </button>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste backup text here"
          style={{ ...inputStyle, height: 140, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
        />
        {importStatus && (
          <div style={{ fontSize: 13, color: importStatus.startsWith("Restored") ? "#7FAE7A" : "#D4756B", marginTop: 8 }}>
            {importStatus}
          </div>
        )}
        {confirmingImport ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, color: "#D4756B", marginBottom: 8 }}>
              This will overwrite all current clients and entries. Continue?
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleRestore} style={{ ...primaryBtn, background: "#D4756B", color: "#1C1913", flex: 1 }}>
                Yes, restore
              </button>
              <button onClick={() => setConfirmingImport(false)} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingImport(true)}
            disabled={!importText.trim()}
            style={{ ...primaryBtn, marginTop: 10, width: "100%", opacity: importText.trim() ? 1 : 0.5 }}
          >
            Restore this backup
          </button>
        )}
      </div>
    </div>
  );
}

function CategoriesScreen({
  categories,
  newCategory,
  setNewCategory,
  categoryError,
  onAdd,
  onDelete,
  onBack,
  editingCategoryId,
  categoryDraftName,
  setCategoryDraftName,
  categoryEditError,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  styles,
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  return (
    <div>
      <button onClick={onBack} style={backBtn}>
        All clients
      </button>

      <h1 style={{ ...styles.display, fontSize: 26, fontWeight: 600, margin: "0 0 1rem", color: "#F3EEE3" }}>
        Jewelry categories
      </h1>
      <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 16 }}>
        Add the types of jewelry you sell here. You'll set a wage price for each one, per client, from that client's page.
      </div>

      <div
        style={{
          background: "#232019",
          border: "1px solid #3A3527",
          borderRadius: 12,
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Gold ring, Chain, Bracelet"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={onAdd} style={primaryBtn}>
            Add
          </button>
        </div>
        {categoryError && <div style={{ color: "#D4756B", fontSize: 13, marginTop: 6 }}>{categoryError}</div>}
      </div>

      {categories.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          No categories yet. Add your first one above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {categories.map((cat) => {
            const isEditing = editingCategoryId === cat.id;
            return (
              <div
                key={cat.id}
                style={{
                  background: "#1C1913",
                  border: "1px solid #3A3527",
                  borderRadius: 8,
                  padding: "0.6rem 0.75rem",
                }}
              >
                {isEditing ? (
                  <div>
                    <input
                      value={categoryDraftName}
                      onChange={(e) => setCategoryDraftName(e.target.value)}
                      style={inputStyle}
                      autoFocus
                    />
                    {categoryEditError && (
                      <div style={{ color: "#D4756B", fontSize: 13, marginTop: 6 }}>{categoryEditError}</div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button onClick={onSaveEdit} style={{ ...primaryBtn, flex: 1 }}>
                        Save
                      </button>
                      <button onClick={onCancelEdit} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 14 }}>{cat.name}</div>
                    {confirmDeleteId === cat.id ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#D4756B" }}>Delete?</span>
                        <button
                          onClick={() => {
                            onDelete(cat.id);
                            setConfirmDeleteId(null);
                          }}
                          style={{ background: "#D4756B", border: "none", borderRadius: 6, color: "#1C1913", cursor: "pointer", padding: "4px 10px", fontSize: 13, fontWeight: 500 }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 6, color: "#8B7355", cursor: "pointer", padding: "4px 10px", fontSize: 13 }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          onClick={() => onStartEdit(cat)}
                          style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 6, color: "#C9A227", cursor: "pointer", padding: "4px 10px", fontSize: 13 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(cat.id)}
                          style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 6, color: "#D4756B", cursor: "pointer", padding: "4px 10px", fontSize: 13 }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailScreen({
  customer,
  ledger,
  balances,
  categories,
  tab,
  setTab,
  onBack,
  entryForm,
  setEntryForm,
  startEntry,
  editEntry,
  submitEntry,
  deleteEntry,
  onDeleteCustomer,
  onRenameCustomer,
  onUpdateContact,
  setClientPrice,
  onManageCategories,
  onAddBook,
  onDeleteBook,
  styles,
}) {
  const [nameActionsOpen, setNameActionsOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(customer.name);
  const [nameError, setNameError] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(customer.phone || "");
  const [addressDraft, setAddressDraft] = useState(customer.address || "");
  const [goldBook, setGoldBook] = useState(null);
  const [wagesBook, setWagesBook] = useState(null);

  const goldExtraBooks = (ledger.extraBooks && ledger.extraBooks.gold) || [];
  const wagesExtraBooks = (ledger.extraBooks && ledger.extraBooks.wages) || [];
  // Newest book first (e.g. 2026, then 2025) — there's no separate
  // "Current" tab; the newest named book is what's active by default.
  const goldBooks = Array.from(new Set([...distinctBooks(ledger.gold), ...goldExtraBooks])).sort().reverse();
  const wagesBooks = Array.from(new Set([...distinctBooks(ledger.wages), ...wagesExtraBooks])).sort().reverse();
  const activeGoldBook = goldBook && goldBooks.includes(goldBook) ? goldBook : goldBooks[0] || "current";
  const activeWagesBook = wagesBook && wagesBooks.includes(wagesBook) ? wagesBook : wagesBooks[0] || "current";
  const goldEntriesForBook = entriesForBook(ledger.gold, activeGoldBook);
  const wagesEntriesForBook = entriesForBook(ledger.wages, activeWagesBook);

  function handleAddBook(kind, bookId) {
    onAddBook(kind, bookId);
    if (kind === "gold") setGoldBook(bookId);
    else setWagesBook(bookId);
  }

  function handleDeleteBook(kind, bookId) {
    onDeleteBook(kind, bookId);
    if (kind === "gold" && activeGoldBook === bookId) setGoldBook(null);
    if (kind === "wages" && activeWagesBook === bookId) setWagesBook(null);
  }

  function handleNameClick() {
    if (editingName) return;
    setNameActionsOpen((v) => !v);
  }

  function startEditName() {
    setNameDraft(customer.name);
    setNameError("");
    setEditingName(true);
    setNameActionsOpen(false);
  }

  function saveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameError("Enter a client name");
      return;
    }
    onRenameCustomer(trimmed);
    setEditingName(false);
  }

  function cancelEditName() {
    setEditingName(false);
    setNameError("");
  }

  function toggleContact() {
    if (contactOpen) {
      setContactOpen(false);
      return;
    }
    setPhoneDraft(customer.phone || "");
    setAddressDraft(customer.address || "");
    setContactOpen(true);
  }

  function saveContact() {
    onUpdateContact({ phone: phoneDraft.trim(), address: addressDraft.trim() });
    setContactOpen(false);
  }

  function cancelContact() {
    setContactOpen(false);
  }

  return (
    <div>
      <button onClick={onBack} style={backBtn}>
        All clients
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: "1.25rem" }}>
        <div style={{ flex: 1 }}>
          {editingName ? (
            <div>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }}
                autoFocus
              />
              {nameError && <div style={{ color: "#D4756B", fontSize: 13, marginTop: 6 }}>{nameError}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={saveName} style={{ ...primaryBtn, padding: "0.4rem 0.9rem" }}>
                  Save
                </button>
                <button onClick={cancelEditName} style={smallBtn}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div onClick={handleNameClick} style={{ cursor: "pointer", display: "inline-block" }}>
                <h1 style={{ ...styles.display, fontSize: 26, fontWeight: 600, margin: 0, color: "#F3EEE3" }}>{customer.name}</h1>
              </div>
              {nameActionsOpen && (
                <button onClick={startEditName} style={{ ...smallBtn, marginTop: 8 }}>
                  Edit
                </button>
              )}
            </div>
          )}
          {customer.phone && !editingName && <div style={{ fontSize: 13, color: "#8B7355", marginTop: 2 }}>{customer.phone}</div>}
          {customer.address && !editingName && <div style={{ fontSize: 13, color: "#8B7355", marginTop: 2 }}>{customer.address}</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={toggleContact}
            aria-label="Contact info"
            style={{ ...smallBtn, width: 38, height: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <CardIcon />
          </button>
          <button onClick={() => setTab("prices")} style={smallBtn}>
            Price list
          </button>
        </div>
      </div>

      {contactOpen && (
        <div style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 10, padding: "0.85rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 8 }}>Contact info</div>
          <input
            value={phoneDraft}
            onChange={(e) => setPhoneDraft(e.target.value)}
            placeholder="Phone number"
            style={inputStyle}
          />
          <input
            value={addressDraft}
            onChange={(e) => setAddressDraft(e.target.value)}
            placeholder="Address"
            style={{ ...inputStyle, marginTop: 8 }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={saveContact} style={{ ...primaryBtn, flex: 1 }}>
              Save
            </button>
            <button onClick={cancelContact} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
        <BalanceCard label="Gold" value={grams(balances.gold)} tone={balances.gold} />
        <BalanceCard label="Wages" value={money(balances.wages)} tone={balances.wages} />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", borderBottom: "1px solid #3A3527" }}>
        {[
          { id: "gold", label: "Gold" },
          { id: "wages", label: "Wages" },
          { id: "review", label: "Review" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: tab === t.id ? "2px solid #C9A227" : "2px solid transparent",
              color: tab === t.id ? "#F3EEE3" : "#8B7355",
              fontSize: 14,
              fontWeight: 500,
              padding: "0.5rem 0.25rem",
              marginRight: 12,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "gold" && (
        <div>
          <BookSelector
            books={goldBooks}
            active={activeGoldBook}
            onSelect={setGoldBook}
            onAddBook={(bookId) => handleAddBook("gold", bookId)}
            onDeleteBook={(bookId) => handleDeleteBook("gold", bookId)}
          />
          {activeGoldBook !== "current" && (
            <BookBalanceLine entries={goldEntriesForBook} formatAmount={grams} />
          )}
          <LedgerSection
            title="Gold"
            takeLabel="Took gold"
            returnLabel="Gave back"
            emptyText="No gold entries yet."
            entries={goldEntriesForBook}
            kind="gold"
            formatAmount={grams}
            onAdd={() => startEntry("gold", activeGoldBook)}
            onEdit={(entry) => editEntry("gold", entry)}
            onDelete={(id) => deleteEntry("gold", id)}
            entryForm={entryForm}
            setEntryForm={setEntryForm}
            submitEntry={submitEntry}
          />
        </div>
      )}

      {tab === "wages" && (
        <div>
          <BookSelector
            books={wagesBooks}
            active={activeWagesBook}
            onSelect={setWagesBook}
            onAddBook={(bookId) => handleAddBook("wages", bookId)}
            onDeleteBook={(bookId) => handleDeleteBook("wages", bookId)}
          />
          {activeWagesBook !== "current" && (
            <BookBalanceLine entries={wagesEntriesForBook} formatAmount={money} />
          )}
          <LedgerSection
            title="Wages"
            takeLabel="Took wages"
            returnLabel="Paid back"
            emptyText="No wage entries yet."
            entries={wagesEntriesForBook}
            kind="wages"
            formatAmount={money}
            onAdd={() => startEntry("wages", activeWagesBook)}
            onEdit={(entry) => editEntry("wages", entry)}
            onDelete={(id) => deleteEntry("wages", id)}
            entryForm={entryForm}
            setEntryForm={setEntryForm}
            submitEntry={submitEntry}
          />
        </div>
      )}

      {tab === "review" && (
        <ReviewSection goldEntries={ledger.gold} wageEntries={ledger.wages} />
      )}

      {tab === "prices" && (
        <PriceListSection categories={categories} prices={ledger.prices || {}} onChange={setClientPrice} onManageCategories={onManageCategories} />
      )}

      <RemoveClientControl customerName={customer.name} onConfirm={onDeleteCustomer} />
    </div>
  );
}

function RemoveClientControl({ customerName, onConfirm }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 13, color: "#D4756B", marginBottom: 8 }}>
          Remove {customerName} and all their records? This can't be undone.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onConfirm} style={{ ...primaryBtn, background: "#D4756B", color: "#1C1913" }}>
            Yes, remove
          </button>
          <button onClick={() => setConfirming(false)} style={smallBtn}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{ marginTop: 28, background: "transparent", border: "none", color: "#8B7355", fontSize: 13, cursor: "pointer", padding: 0 }}
    >
      Remove this client
    </button>
  );
}

function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <line x1="2.5" y1="9.5" x2="21.5" y2="9.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="5.5" y1="14" x2="10.5" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function bookLabel(book) {
  return book === "current" ? "Current" : book;
}

function BookSelector({ books, active, onSelect, onAddBook, onDeleteBook }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newBookName, setNewBookName] = useState("");
  const [addError, setAddError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function closeAll() {
    setMenuOpen(false);
    setAdding(false);
    setNewBookName("");
    setAddError("");
    setConfirmingDelete(false);
  }

  function submitAddBook() {
    const name = newBookName.trim();
    if (!name) {
      setAddError("Enter a book name");
      return;
    }
    if (name === "current" || books.includes(name)) {
      setAddError("That book already exists");
      return;
    }
    onAddBook(name);
    closeAll();
  }

  function confirmDelete() {
    onDeleteBook(active);
    closeAll();
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {books.map((b) => (
            <button
              key={b}
              onClick={() => onSelect(b)}
              style={{
                background: active === b ? "#C9A227" : "#232019",
                border: "1px solid " + (active === b ? "#C9A227" : "#3A3527"),
                borderRadius: 999,
                padding: "0.3rem 0.8rem",
                color: active === b ? "#1C1913" : "#C9A227",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {bookLabel(b)}
            </button>
          ))}
        </div>
        <button
          onClick={() => (menuOpen ? closeAll() : setMenuOpen(true))}
          aria-label="Book options"
          style={{
            background: "transparent",
            border: "none",
            color: "#8B7355",
            fontSize: 18,
            lineHeight: 1,
            padding: "0.3rem 0.4rem",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ⋮
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            marginTop: 8,
            background: "#232019",
            border: "1px solid #3A3527",
            borderRadius: 10,
            padding: "0.75rem",
          }}
        >
          {!adding && !confirmingDelete && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                onClick={() => setAdding(true)}
                style={{ ...smallBtn, textAlign: "left" }}
              >
                Add new book
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                disabled={active === "current"}
                style={{
                  ...smallBtn,
                  textAlign: "left",
                  color: active === "current" ? "#5A5340" : "#D4756B",
                  opacity: active === "current" ? 0.6 : 1,
                }}
              >
                Delete "{bookLabel(active)}" book
              </button>
            </div>
          )}

          {adding && (
            <div>
              <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 8 }}>
                e.g. 2027
              </div>
              <input
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder="Book name"
                style={inputStyle}
                autoFocus
              />
              {addError && <div style={{ color: "#D4756B", fontSize: 13, marginTop: 6 }}>{addError}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={submitAddBook} style={{ ...primaryBtn, flex: 1 }}>
                  Add book
                </button>
                <button onClick={closeAll} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {confirmingDelete && (
            <div>
              <div style={{ fontSize: 13, color: "#D4756B", marginBottom: 8 }}>
                Delete the "{bookLabel(active)}" book? All its entries will be permanently removed.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={confirmDelete} style={{ ...primaryBtn, background: "#D4756B", color: "#1C1913", flex: 1 }}>
                  Yes, delete
                </button>
                <button onClick={closeAll} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookBalanceLine({ entries, formatAmount }) {
  const total = (entries || []).reduce((s, e) => s + e.amount, 0);
  const color = total > 0 ? "#D4756B" : total < 0 ? "#7FAE7A" : "#8B7355";
  return (
    <div style={{ fontSize: 12.5, color: "#8B7355", marginBottom: 10 }}>
      Balance for this book: <span style={{ color, fontWeight: 500 }}>{formatAmount(total)}</span>
    </div>
  );
}

function BalanceCard({ label, value, tone }) {
  const color = tone > 0 ? "#D4756B" : tone < 0 ? "#7FAE7A" : "#F3EEE3";
  return (
    <div
      style={{
        flex: 1,
        background: "#232019",
        border: "1px solid #3A3527",
        borderRadius: 12,
        padding: "0.85rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 12, color: "#8B7355", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#8B7355", marginTop: 2 }}>
        {tone > 0 ? "owed to you" : tone < 0 ? "owed to client" : "settled"}
      </div>
    </div>
  );
}

function ReviewSection({ goldEntries, wageEntries }) {
  const goldRows = buildMonthlyReview(goldEntries);
  const wageRows = buildMonthlyReview(wageEntries);

  return (
    <div>
      <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 14 }}>
        For each month, what was still owed coming in vs. what got paid back by month's end. Repayment is expected within 4 weeks, so anything left owed here is running late.
      </div>
      <ReviewTable title="Gold" rows={goldRows} formatAmount={grams} emptyText="No gold history yet." />
      <div style={{ height: 20 }} />
      <ReviewTable title="Wages" rows={wageRows} formatAmount={money} emptyText="No wage history yet." />
    </div>
  );
}

function ReviewTable({ title, rows, formatAmount, emptyText }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 500, color: "#F3EEE3", marginBottom: 8 }}>{title}</div>
      {rows.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 13, padding: "0.5rem 0" }}>{emptyText}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {rows.map((r) => (
            <div
              key={r.key}
              style={{
                background: "#1C1913",
                border: "1px solid " + (r.late ? "#D4756B" : "#3A3527"),
                borderRadius: 8,
                padding: "0.6rem 0.75rem",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: "#F3EEE3", marginBottom: 6 }}>{monthLabel(r.key)}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#8B7355" }}>Owed at start (1st)</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: r.owedAtStart > 0 ? "#D4756B" : "#8B7355" }}>
                    {formatAmount(r.owedAtStart)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#8B7355" }}>Paid back (by end)</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#7FAE7A" }}>{formatAmount(r.paidThisMonth)}</div>
                </div>
              </div>
              {r.late && (
                <div style={{ fontSize: 12, color: "#D4756B", marginTop: 6 }}>
                  Late — {formatAmount(r.owedAtStart - r.paidThisMonth)} still outstanding from this period
                </div>
              )}
              {r.takenLaterThisMonth > 0 && (
                <div style={{ fontSize: 12, color: "#8B7355", marginTop: 6 }}>
                  +{formatAmount(r.takenLaterThisMonth)} taken later in the month (not counted above)
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceListSection({ categories, prices, onChange, onManageCategories }) {
  const [drafts, setDrafts] = useState(() => {
    const d = {};
    categories.forEach((c) => {
      d[c.id] = prices[c.id] != null ? String(prices[c.id]) : "";
    });
    return d;
  });

  useEffect(() => {
    const d = {};
    categories.forEach((c) => {
      d[c.id] = prices[c.id] != null ? String(prices[c.id]) : "";
    });
    setDrafts(d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  function commit(categoryId) {
    const raw = drafts[categoryId];
    if (raw === "" || raw === undefined) {
      onChange(categoryId, null);
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) onChange(categoryId, num);
  }

  if (categories.length === 0) {
    return (
      <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "1.5rem 0" }}>
        No jewelry categories yet.
        <div style={{ marginTop: 10 }}>
          <button onClick={onManageCategories} style={smallBtn}>
            Add categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 10 }}>
        Set this client's wage price for each category.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#1C1913",
              border: "1px solid #3A3527",
              borderRadius: 8,
              padding: "0.6rem 0.75rem",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 14, flex: 1 }}>{cat.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 13, color: "#8B7355" }}>$</span>
              <input
                value={drafts[cat.id] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [cat.id]: e.target.value }))}
                onBlur={() => commit(cat.id)}
                inputMode="decimal"
                placeholder="—"
                style={{ ...inputStyle, width: 80, textAlign: "right" }}
              />
            </div>
          </div>
        ))}
      </div>
      <button onClick={onManageCategories} style={{ ...smallBtn, marginTop: 12 }}>
        Edit categories
      </button>
    </div>
  );
}

function LedgerSection({ title, takeLabel, returnLabel, emptyText, entries, kind, formatAmount, onAdd, onEdit, onDelete, entryForm, setEntryForm, submitEntry }) {
  const isOpen = entryForm.open === kind;
  const isEditing = isOpen && !!entryForm.editId;
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formConfirmDelete, setFormConfirmDelete] = useState(false);

  function toggleRow(id) {
    if (expandedId === id) {
      setExpandedId(null);
      setConfirmDeleteId(null);
    } else {
      setExpandedId(id);
      setConfirmDeleteId(null);
    }
  }

  const sortedEntries = [...entries].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const chronological = [...entries].reverse().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const balanceAfter = {};
  let running = 0;
  chronological.forEach((e) => {
    running += e.amount;
    balanceAfter[e.id] = running;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#F3EEE3" }}>{title}</div>
        <button onClick={onAdd} style={smallBtn}>
          Add
        </button>
      </div>

      {isOpen && (
        <div style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 10, padding: "0.85rem", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => setEntryForm((f) => ({ ...f, direction: "take" }))}
              style={toggleBtn(entryForm.direction === "take")}
            >
              {takeLabel}
            </button>
            <button
              onClick={() => setEntryForm((f) => ({ ...f, direction: "return" }))}
              style={toggleBtn(entryForm.direction === "return")}
            >
              {returnLabel}
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={entryForm.amount}
              onChange={(e) => setEntryForm((f) => ({ ...f, amount: toEnglishDigits(e.target.value) }))}
              placeholder={kind === "gold" ? "Grams" : "Amount"}
              inputMode="decimal"
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="date"
              value={entryForm.date}
              onChange={(e) => setEntryForm((f) => ({ ...f, date: e.target.value }))}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <input
            value={entryForm.note}
            onChange={(e) => setEntryForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Note (optional)"
            style={{ ...inputStyle, marginTop: 8 }}
          />
          {entryForm.error && <div style={{ color: "#D4756B", fontSize: 13, marginTop: 6 }}>{entryForm.error}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={submitEntry} style={{ ...primaryBtn, flex: 1 }}>
              {isEditing ? "Update" : "Save"}
            </button>
            <button
              onClick={() => {
                setEntryForm({ open: null, direction: "take", amount: "", date: todayStr(), note: "", error: "", editId: null });
                setFormConfirmDelete(false);
              }}
              style={{ ...smallBtn, flex: 1, textAlign: "center" }}
            >
              Cancel
            </button>
          </div>
          {isEditing && (
            <div style={{ marginTop: 10 }}>
              {formConfirmDelete ? (
                <div>
                  <div style={{ fontSize: 13, color: "#D4756B", marginBottom: 6 }}>Delete this entry for good?</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => {
                        onDelete(entryForm.editId);
                        setEntryForm({ open: null, direction: "take", amount: "", date: todayStr(), note: "", error: "", editId: null });
                        setFormConfirmDelete(false);
                      }}
                      style={{ ...primaryBtn, flex: 1, background: "#D4756B", color: "#1C1913" }}
                    >
                      Yes, delete
                    </button>
                    <button onClick={() => setFormConfirmDelete(false)} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setFormConfirmDelete(true)}
                  style={{ background: "transparent", border: "none", color: "#D4756B", fontSize: 13, cursor: "pointer", padding: 0 }}
                >
                  Delete this entry
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {sortedEntries.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 13, padding: "0.5rem 0" }}>{emptyText}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sortedEntries.map((e) => {
            const isTake = e.amount > 0;
            const isExpanded = expandedId === e.id;
            const isConfirming = confirmDeleteId === e.id;
            return (
              <div
                key={e.id}
                onClick={() => toggleRow(e.id)}
                style={{
                  background: "#1C1913",
                  border: "1px solid #3A3527",
                  borderRadius: 8,
                  padding: "0.6rem 0.75rem",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#8B7355" }}>Balance</div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: balanceAfter[e.id] > 0 ? "#D4756B" : balanceAfter[e.id] < 0 ? "#7FAE7A" : "#8B7355",
                      }}
                    >
                      {formatAmount(balanceAfter[e.id])}
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 13, color: isTake ? "#D4756B" : "#7FAE7A" }}>
                      {isTake ? takeLabel : returnLabel}
                    </div>
                    <div style={{ fontSize: 12, color: "#8B7355" }}>
                      {e.date}
                      {e.note ? ` · ${e.note}` : ""}
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#F3EEE3" }}>{formatAmount(Math.abs(e.amount))}</div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #3A3527" }}>
                    {isConfirming ? (
                      <div>
                        <div style={{ fontSize: 13, color: "#D4756B", marginBottom: 6 }}>Delete this entry for good?</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              onDelete(e.id);
                            }}
                            style={{ background: "#D4756B", border: "none", borderRadius: 6, color: "#1C1913", cursor: "pointer", padding: "6px 12px", fontSize: 13, fontWeight: 500, flex: 1 }}
                          >
                            Yes, delete
                          </button>
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            style={{ ...smallBtn, flex: 1, textAlign: "center" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onEdit(e);
                          }}
                          style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 6, color: "#C9A227", cursor: "pointer", padding: "4px 10px", fontSize: 13 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setConfirmDeleteId(e.id);
                          }}
                          style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 6, color: "#D4756B", cursor: "pointer", padding: "4px 10px", fontSize: 13 }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function toggleBtn(active) {
  return {
    flex: 1,
    background: active ? "#C9A227" : "#1C1913",
    border: "1px solid " + (active ? "#C9A227" : "#3A3527"),
    borderRadius: 8,
    padding: "0.5rem",
    color: active ? "#1C1913" : "#8B7355",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  };
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#1C1913",
  border: "1px solid #3A3527",
  borderRadius: 8,
  padding: "0.6rem 0.75rem",
  color: "#F3EEE3",
  fontSize: 14,
  fontFamily: "'Inter', sans-serif",
};

const primaryBtn = {
  background: "#C9A227",
  border: "none",
  borderRadius: 8,
  padding: "0.65rem 1rem",
  color: "#1C1913",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

const smallBtn = {
  background: "#232019",
  border: "1px solid #3A3527",
  borderRadius: 8,
  padding: "0.4rem 0.8rem",
  color: "#C9A227",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

const backBtn = {
  display: "flex",
  alignItems: "center",
  background: "transparent",
  border: "none",
  color: "#8B7355",
  fontSize: 13,
  cursor: "pointer",
  padding: 0,
  marginBottom: 16,
};

function PlaceholderTab({ title }) {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        maxWidth: 480,
        margin: "0 auto",
        padding: "3rem 1rem",
        textAlign: "center",
        color: "#8B7355",
      }}
    >
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#F3EEE3", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 14 }}>Coming soon.</div>
    </div>
  );
}

function ReviewsTab() {
  const [view, setView] = useState(null); // null | "assets-liabilities" | "sales"

  if (view === "assets-liabilities") {
    return (
      <div>
        <button onClick={() => setView(null)} style={backBtn}>
          &larr; Reviews
        </button>
        <AssetsLiabilitiesScreen />
      </div>
    );
  }

  if (view === "sales") {
    return (
      <div>
        <button onClick={() => setView(null)} style={backBtn}>
          &larr; Reviews
        </button>
        <SalesScreen />
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#F3EEE3", marginBottom: 16 }}>
        Reviews
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => setView("assets-liabilities")} style={bigHomeBtn}>
          Assets &amp; Liabilities
        </button>
        <button onClick={() => setView("sales")} style={bigHomeBtn}>
          Sales
        </button>
      </div>
    </div>
  );
}

function AssetsLiabilitiesScreen() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ goldAssets: 0, goldLiabilities: 0, wageAssets: 0, wageLiabilities: 0 });
  const [debugInfo, setDebugInfo] = useState({ clientCount: 0, error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let customers = [];
      let fetchError = null;
      try {
        const res = await window.storage.get("customers-list", false);
        customers = res ? JSON.parse(res.value) : [];
      } catch (e) {
        customers = [];
        fetchError = "customers-list: " + (e && e.message ? e.message : String(e));
      }

      let goldAssets = 0;
      let goldLiabilities = 0;
      let wageAssets = 0;
      let wageLiabilities = 0;

      let allLedgers = {};
      try {
        allLedgers = await fetchAllLedgers(customers);
      } catch (e) {
        if (!fetchError) fetchError = "ledgers: " + (e && e.message ? e.message : String(e));
      }

      for (const c of customers) {
        const ledger = allLedgers[c.id] || emptyLedger();
        const goldBalance = (ledger.gold || []).reduce((s, e) => s + e.amount, 0);
        const wageBalance = (ledger.wages || []).reduce((s, e) => s + e.amount, 0);
        if (goldBalance > 0) goldAssets += goldBalance;
        else if (goldBalance < 0) goldLiabilities += Math.abs(goldBalance);
        if (wageBalance > 0) wageAssets += wageBalance;
        else if (wageBalance < 0) wageLiabilities += Math.abs(wageBalance);
      }

      if (!cancelled) {
        setTotals({ goldAssets, goldLiabilities, wageAssets, wageLiabilities });
        setDebugInfo({ clientCount: customers.length, error: fetchError });
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>Loading…</div>;
  }

  return (
    <div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#F3EEE3", marginBottom: 16 }}>
        Assets &amp; Liabilities
      </div>
      <div style={{ fontSize: 12, letterSpacing: 0.3, color: "#8B7355", marginBottom: 8 }}>Gold</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <SummaryCard label="Owed to you" value={grams(totals.goldAssets)} color="#D4756B" />
        <SummaryCard label="You owe" value={grams(totals.goldLiabilities)} color="#7FAE7A" />
      </div>
      <div style={{ fontSize: 12, letterSpacing: 0.3, color: "#8B7355", marginBottom: 8 }}>Wages</div>
      <div style={{ display: "flex", gap: 10 }}>
        <SummaryCard label="Owed to you" value={money(totals.wageAssets)} color="#D4756B" />
        <SummaryCard label="You owe" value={money(totals.wageLiabilities)} color="#7FAE7A" />
      </div>
      <div style={{ fontSize: 11, color: "#5A5340", marginTop: 20, textAlign: "center" }}>
        {debugInfo.clientCount} client(s) checked
        {debugInfo.error ? ` — error: ${debugInfo.error}` : ""}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#232019",
        border: "1px solid #3A3527",
        borderRadius: 12,
        padding: "0.85rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 12, color: "#8B7355", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}

// Aggregates every "take" entry (amount > 0 = gold/wages given to a client,
// i.e. a sale) across all clients, grouped by the month it happened in.
function buildMonthlySales(customersLedgers) {
  const monthMap = {};
  const touch = (key) => {
    if (!monthMap[key]) monthMap[key] = { gold: 0, wages: 0 };
    return monthMap[key];
  };
  customersLedgers.forEach((ledger) => {
    (ledger.gold || []).forEach((e) => {
      if (e.amount > 0) touch(monthKey(e.date)).gold += e.amount;
    });
    (ledger.wages || []).forEach((e) => {
      if (e.amount > 0) touch(monthKey(e.date)).wages += e.amount;
    });
  });
  return Object.keys(monthMap)
    .sort()
    .reverse()
    .map((key) => ({ key, ...monthMap[key] }));
}

function SalesScreen() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let customers = [];
      let fetchError = null;
      try {
        const res = await window.storage.get("customers-list", false);
        customers = res ? JSON.parse(res.value) : [];
      } catch (e) {
        customers = [];
        fetchError = "customers-list: " + (e && e.message ? e.message : String(e));
      }

      let ledgersById = {};
      try {
        ledgersById = await fetchAllLedgers(customers);
      } catch (e) {
        fetchError = "ledgers: " + (e && e.message ? e.message : String(e));
      }
      const ledgers = customers.map((c) => ledgersById[c.id] || emptyLedger());

      if (!cancelled) {
        setRows(buildMonthlySales(ledgers));
        setError(fetchError);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>Loading…</div>;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#F3EEE3", marginBottom: 4 }}>
        Sales
      </div>
      <div style={{ fontSize: 12.5, color: "#8B7355", marginBottom: 18 }}>
        Total gold and wages taken by clients, by month
      </div>

      {rows.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          No sales recorded yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((row) => (
            <MonthSalesCard key={row.key} label={monthLabel(row.key)} gold={row.gold} wages={row.wages} />
          ))}
        </div>
      )}

      {error ? (
        <div style={{ fontSize: 11, color: "#5A5340", marginTop: 20, textAlign: "center" }}>error: {error}</div>
      ) : null}
    </div>
  );
}

function MonthSalesCard({ label, gold, wages }) {
  return (
    <div
      style={{
        background: "#232019",
        border: "1px solid #3A3527",
        borderRadius: 14,
        padding: "1rem 1.1rem",
      }}
    >
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: "#F3EEE3", marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <SummaryCard label="Gold sold" value={grams(gold)} color="#C9A227" />
        <SummaryCard label="Wages sold" value={money(wages)} color="#C9A227" />
      </div>
    </div>
  );
}

const bigHomeBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "1.5rem",
  fontFamily: "'Fraunces', serif",
  fontSize: 20,
  fontWeight: 600,
  color: "#F3EEE3",
  background: "#232019",
  border: "1px solid #3A3527",
  borderRadius: 14,
  cursor: "pointer",
};

export default function Ledger() {
  const [homeTab, setHomeTab] = useState(null);

  if (!homeTab) {
    return (
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          maxWidth: 480,
          margin: "0 auto",
          padding: "2rem 1rem",
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 0.3, color: "#8B7355", marginBottom: 2 }}>Home</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, margin: "0 0 1.5rem", color: "#F3EEE3" }}>
          Modern Gold
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setHomeTab("clients")} style={bigHomeBtn}>
            Clients
          </button>
          <button onClick={() => setHomeTab("receipts")} style={bigHomeBtn}>
            Receipts
          </button>
          <button onClick={() => setHomeTab("reviews")} style={bigHomeBtn}>
            Reviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 480, margin: "0 auto", padding: "1rem 1rem 0" }}>
      <button onClick={() => setHomeTab(null)} style={backBtn}>
        Home
      </button>
      {homeTab === "clients" && <ClientsTab />}
      {homeTab === "receipts" && <PlaceholderTab title="Receipts" />}
      {homeTab === "reviews" && <ReviewsTab />}
    </div>
  );
}
