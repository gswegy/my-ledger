import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

const uid = () => Math.random().toString(36).slice(2, 10);


// ---------------------------------------------------------------------------
// Language support (English / Arabic). Numbers, dates, and money/gram
// amounts always stay in English digits (see toEnglishDigits/money/grams
// above) — only the UI copy switches.
// ---------------------------------------------------------------------------
const translations = {
  en: {
    home: "Home", app_title: "Modern Gold", nav_clients: "Clients", nav_receipts: "Receipts", nav_reviews: "Reviews",
    sr_ledger_desc: "Client ledger for tracking gold, wages, and jewelry price lists",
    loading_ledger: "Loading ledger…", loading: "Loading…",
    client_ledger_label: "Client ledger", your_clients: "Your clients", backup: "Backup", categories: "Categories",
    add_a_client: "Add a client", client_name_ph: "Client name", phone_optional_ph: "Phone (optional)",
    add_client: "Add client", cancel: "Cancel", add_new_client: "+ Add new client", search_clients_ph: "Search clients",
    no_clients_yet: "No clients yet. Add your first one above.", no_clients_match: 'No clients match "{q}".',
    gold_amount: "Gold {v}", wages_amount: "Wages {v}", enter_client_name: "Enter a client name",
    all_clients: "All clients", backup_restore: "Backup & restore", export_your_data: "Export your data",
    export_desc: "Copy this and save it somewhere safe (Notes, email to yourself, etc.). Paste it back in below any time you need to restore it — for example, after I send you an updated version of this app.",
    preparing_backup: "Preparing backup…", copy_backup: "Copy backup", copied: "Copied",
    copy_failed: "Couldn't copy — select and copy manually", save_to_file: "Save to file",
    daily_backups: "Daily backups",
    daily_backups_desc: "A snapshot is saved automatically once a day when you open the app. If something ever goes wrong, restore the most recent good one below.",
    no_daily_backups: "No automatic backups yet — one will be created next time you open the app.",
    restore_daily_confirm: "Restore the {d} backup? This overwrites everything currently in the app.",
    yes_restore: "Yes, restore", restore: "Restore",
    restored_success: "Restored {d} successfully", restore_failed_daily: "Couldn't restore that backup — nothing was changed",
    restore_from_backup: "Restore from backup",
    restore_desc: "Paste a previously copied backup here, or upload a saved backup file. This replaces everything currently in the app.",
    upload_backup_file: "Upload backup file", paste_backup_ph: "Paste backup text here",
    restored_successfully: "Restored successfully", restore_failed_invalid: "That didn't look like a valid backup — nothing was changed",
    overwrite_confirm: "This will overwrite all current clients and entries. Continue?", restore_this_backup: "Restore this backup",
    jewelry_categories: "Jewelry categories",
    categories_desc: "Add the types of jewelry you sell here. You'll set a wage price for each one, per client, from that client's page.",
    category_ph: "e.g. Gold ring, Chain, Bracelet", add: "Add", enter_category_name: "Enter a category name",
    no_categories_yet: "No categories yet. Add your first one above.", delete_q: "Delete?", yes: "Yes",
    edit: "Edit", delete: "Delete", save: "Save",
    contact_info: "Contact info", price_list: "Price list", phone_number_ph: "Phone number", address_ph: "Address",
    tab_gold: "Gold", tab_wages: "Wages", tab_review: "Review",
    took_gold: "Took gold", gave_back: "Gave back", no_gold_entries: "No gold entries yet.",
    took_wages: "Took wages", paid_back_label: "Paid back", no_wage_entries: "No wage entries yet.",
    remove_client_confirm: "Remove {name} and all their records? This can't be undone.",
    yes_remove: "Yes, remove", remove_this_client: "Remove this client",
    book_options: "Book options", add_new_book: "Add new book", delete_book_named: 'Delete "{b}" book',
    book_hint: "e.g. 2027", book_name_ph: "Book name", add_book: "Add book",
    enter_book_name: "Enter a book name", book_already_exists: "That book already exists",
    delete_book_confirm: 'Delete the "{b}" book? All its entries will be permanently removed.', yes_delete: "Yes, delete",
    current_book: "Current", balance_for_book: "Balance for this book: {v}",
    owed_to_you: "owed to you", owed_to_client: "owed to client", settled: "settled",
    activity: "Activity", custom_activity: "Custom Activity", back: "Back",
    custom_activity_desc: "Pick a date range to see how much gold and wages were taken and paid back in that period.",
    from_label: "From", to_label: "To", taken: "Taken", paid_back_stat: "Paid back",
    review_desc: "For each month, what was still owed coming in vs. what got paid back by month's end. Repayment is expected within 4 weeks, so anything left owed here is running late.",
    no_gold_history: "No gold history yet.", no_wage_history: "No wage history yet.",
    owed_at_start: "Owed at start (1st)", paid_back_by_end: "Paid back (by end)",
    late_outstanding: "Late — {v} still outstanding from this period",
    taken_later: "+{v} taken later in the month (not counted above)",
    no_jewelry_categories: "No jewelry categories yet.", add_categories: "Add categories",
    set_wage_price_desc: "Set this client's wage price for each category.", edit_categories: "Edit categories",
    balance: "Balance", note_optional_ph: "Note (optional)", grams_ph: "Grams", amount_ph: "Amount",
    update: "Update", delete_entry_confirm: "Delete this entry for good?", delete_this_entry: "Delete this entry",
    coming_soon: "Coming soon.",
    receipts: "Receipts", create_receipt: "Create Receipt", view_receipts: "View Receipts",
    saved_receipts: "Saved Receipts", no_receipts_yet: "No receipts saved yet.", unnamed_client: "Unnamed client",
    receipt_no_date: "No. {no} · {date}", no_date: "no date",
    couldnt_load_receipt: "Couldn't load that receipt",
    statement: "Statement", order_details: "order details", no_label: "NO.",
    date_label: "Date:", note_label: "Note:", requested_from: "Requested from Mr.:",
    search_client_name_ph: "Search client name…",
    linked_client: "Linked to client — totals will post to their book",
    not_linked_client: "Not linked — pick a name from the list to post totals",
    duplicate_name_hint: "same name as another client — check you picked the right one",
    sales_section: "Sales", category_col: "Category", price_col: "Price", labor_col: "Labor", gram_col: "Gram",
    select_category_ph: "Select category…", total_label: "Total", discount_label: "Discount",
    add_row: "+ Add row", clear: "Clear", payments_section: "Payments",
    method_col: "Method", gold21k_col: "21k Gold", notes_col: "Notes",
    select_method_ph: "Select method…", method_bars: "Bars", method_scrap: "Scrap", method_money: "Money", method_transfer: "Transfer",
    wt_g_ph: "Wt (g)", karat_ph: "Karat", money_ph: "Money", gold_price_ph: "Gold price",
    total_paid: "Total Paid", saving: "Saving…", deleting: "Deleting…", print: "Print",
    foot_note: "Prices subject to the daily gold rate",
    delete_row_title: "Delete row",
    clear_rows_confirm: "Clear all rows?", clear_payments_confirm: "Clear all payment rows?",
    delete_receipt_confirm: "Delete this receipt? This can't be undone.",
    saved_posted: "Saved & posted to client", saved_unlinked: "Saved (not linked to a client)",
    saved_posting_failed: "Saved, but posting to client failed — try again",
    save_failed: "Save failed", delete_failed: "Delete failed",
    reviews: "Reviews", assets_liabilities: "Assets & Liabilities", sales: "Sales",
    gold_section: "Gold", wages_section: "Wages", owed_to_you_card: "Owed to you", you_owe_card: "You owe",
    clients_checked: "{n} client(s) checked", error_label: " — error: {e}",
    sales_desc: "Total gold and wages taken by clients, by month", no_sales_yet: "No sales recorded yet.",
    gold_sold: "Gold sold", wages_sold: "Wages sold",
    transactions: "Transactions",
    transactions_desc: "Pick a date range to see every client's gold and wage movements in that period — including statements not linked to a client.",
    unlinked_tag: "Unlinked statement", no_transactions: "No movements in this period.",
  },
  ar: {
    home: "الرئيسية", app_title: "الذهب الحديث", nav_clients: "العملاء", nav_receipts: "الإيصالات", nav_reviews: "المراجعات",
    sr_ledger_desc: "سجل عملاء لتتبع الذهب والأجور وقوائم أسعار المجوهرات",
    loading_ledger: "جارٍ تحميل السجل…", loading: "جارٍ التحميل…",
    client_ledger_label: "سجل العملاء", your_clients: "عملاؤك", backup: "نسخ احتياطي", categories: "الفئات",
    add_a_client: "إضافة عميل", client_name_ph: "اسم العميل", phone_optional_ph: "الهاتف (اختياري)",
    add_client: "إضافة عميل", cancel: "إلغاء", add_new_client: "+ إضافة عميل جديد", search_clients_ph: "بحث عن العملاء",
    no_clients_yet: "لا يوجد عملاء بعد. أضف أول عميل أعلاه.", no_clients_match: 'لا يوجد عملاء مطابقون لـ "{q}".',
    gold_amount: "ذهب {v}", wages_amount: "أجور {v}", enter_client_name: "أدخل اسم العميل",
    all_clients: "جميع العملاء", backup_restore: "النسخ الاحتياطي والاستعادة", export_your_data: "تصدير بياناتك",
    export_desc: "انسخ هذا واحفظه في مكان آمن (الملاحظات، بريد إلكتروني لنفسك، إلخ). الصقه مرة أخرى أدناه في أي وقت تحتاج فيه لاستعادته — على سبيل المثال بعد إرسال نسخة محدثة من هذا التطبيق.",
    preparing_backup: "جارٍ تحضير النسخة الاحتياطية…", copy_backup: "نسخ النسخة الاحتياطية", copied: "تم النسخ",
    copy_failed: "تعذر النسخ — حدد وانسخ يدويًا", save_to_file: "حفظ كملف",
    daily_backups: "النسخ الاحتياطية اليومية",
    daily_backups_desc: "يتم حفظ لقطة تلقائيًا مرة واحدة يوميًا عند فتح التطبيق. إذا حدث خطأ ما، استعد آخر نسخة جيدة أدناه.",
    no_daily_backups: "لا توجد نسخ احتياطية تلقائية بعد — سيتم إنشاء واحدة في المرة القادمة التي تفتح فيها التطبيق.",
    restore_daily_confirm: "استعادة نسخة {d} الاحتياطية؟ سيؤدي هذا إلى استبدال كل شيء في التطبيق حاليًا.",
    yes_restore: "نعم، استعادة", restore: "استعادة",
    restored_success: "تمت استعادة {d} بنجاح", restore_failed_daily: "تعذرت استعادة هذه النسخة — لم يتغير شيء",
    restore_from_backup: "الاستعادة من نسخة احتياطية",
    restore_desc: "الصق نسخة احتياطية منسوخة سابقًا هنا، أو ارفع ملف نسخة احتياطية محفوظ. سيؤدي هذا إلى استبدال كل شيء في التطبيق حاليًا.",
    upload_backup_file: "رفع ملف النسخة الاحتياطية", paste_backup_ph: "الصق نص النسخة الاحتياطية هنا",
    restored_successfully: "تمت الاستعادة بنجاح", restore_failed_invalid: "لا يبدو هذا نسخة احتياطية صالحة — لم يتغير شيء",
    overwrite_confirm: "سيؤدي هذا إلى استبدال جميع العملاء والقيود الحالية. هل تريد المتابعة؟", restore_this_backup: "استعادة هذه النسخة",
    jewelry_categories: "فئات المجوهرات",
    categories_desc: "أضف هنا أنواع المجوهرات التي تبيعها. ستحدد سعر الأجرة لكل نوع، لكل عميل، من صفحة ذلك العميل.",
    category_ph: "مثال: خاتم ذهب، سلسلة، سوار", add: "إضافة", enter_category_name: "أدخل اسم الفئة",
    no_categories_yet: "لا توجد فئات بعد. أضف أول فئة أعلاه.", delete_q: "حذف؟", yes: "نعم",
    edit: "تعديل", delete: "حذف", save: "حفظ",
    contact_info: "معلومات الاتصال", price_list: "قائمة الأسعار", phone_number_ph: "رقم الهاتف", address_ph: "العنوان",
    tab_gold: "ذهب", tab_wages: "أجور", tab_review: "مراجعة",
    took_gold: "أخذ ذهب", gave_back: "أعاد", no_gold_entries: "لا توجد قيود ذهب بعد.",
    took_wages: "أخذ أجور", paid_back_label: "أعاد الدفع", no_wage_entries: "لا توجد قيود أجور بعد.",
    remove_client_confirm: "إزالة {name} وجميع سجلاته؟ لا يمكن التراجع عن هذا.",
    yes_remove: "نعم، إزالة", remove_this_client: "إزالة هذا العميل",
    book_options: "خيارات الدفتر", add_new_book: "إضافة دفتر جديد", delete_book_named: 'حذف دفتر "{b}"',
    book_hint: "مثال: 2027", book_name_ph: "اسم الدفتر", add_book: "إضافة دفتر",
    enter_book_name: "أدخل اسم الدفتر", book_already_exists: "هذا الدفتر موجود بالفعل",
    delete_book_confirm: 'حذف دفتر "{b}"؟ ستتم إزالة جميع قيوده نهائيًا.', yes_delete: "نعم، حذف",
    current_book: "الحالي", balance_for_book: "رصيد هذا الدفتر: {v}",
    owed_to_you: "مستحق لك", owed_to_client: "مستحق للعميل", settled: "مسوّى",
    activity: "النشاط", custom_activity: "نشاط مخصص", back: "رجوع",
    custom_activity_desc: "اختر نطاقًا زمنيًا لمعرفة كمية الذهب والأجور التي تم أخذها وسدادها خلال تلك الفترة.",
    from_label: "من", to_label: "إلى", taken: "مأخوذ", paid_back_stat: "تم سداده",
    review_desc: "لكل شهر، ما كان لا يزال مستحقًا في بدايته مقابل ما تم سداده بنهايته. من المتوقع السداد خلال 4 أسابيع، لذا أي مبلغ متبقٍ هنا متأخر.",
    no_gold_history: "لا يوجد سجل ذهب بعد.", no_wage_history: "لا يوجد سجل أجور بعد.",
    owed_at_start: "المستحق في البداية (1)", paid_back_by_end: "المسدد (بنهاية الشهر)",
    late_outstanding: "متأخر — لا يزال {v} مستحقًا من هذه الفترة",
    taken_later: "+{v} تم أخذه لاحقًا في الشهر (غير محتسب أعلاه)",
    no_jewelry_categories: "لا توجد فئات مجوهرات بعد.", add_categories: "إضافة فئات",
    set_wage_price_desc: "حدد سعر الأجرة لهذا العميل لكل فئة.", edit_categories: "تعديل الفئات",
    balance: "الرصيد", note_optional_ph: "ملاحظة (اختياري)", grams_ph: "غرام", amount_ph: "المبلغ",
    update: "تحديث", delete_entry_confirm: "حذف هذا القيد نهائيًا؟", delete_this_entry: "حذف هذا القيد",
    coming_soon: "قريبًا.",
    receipts: "الإيصالات", create_receipt: "إنشاء إيصال", view_receipts: "عرض الإيصالات",
    saved_receipts: "الإيصالات المحفوظة", no_receipts_yet: "لا توجد إيصالات محفوظة بعد.", unnamed_client: "عميل بدون اسم",
    receipt_no_date: "رقم {no} · {date}", no_date: "بدون تاريخ",
    couldnt_load_receipt: "تعذر تحميل هذا الإيصال",
    statement: "كشف حساب", order_details: "تفاصيل الطلب", no_label: "رقم.",
    date_label: "التاريخ:", note_label: "ملاحظة:", requested_from: "مطلوب من السيد:",
    search_client_name_ph: "ابحث عن اسم العميل…",
    linked_client: "مرتبط بعميل — ستُرحّل الإجماليات إلى دفتره",
    not_linked_client: "غير مرتبط — اختر اسمًا من القائمة لترحيل الإجماليات",
    duplicate_name_hint: "نفس اسم عميل آخر — تأكد أنك اخترت الشخص الصحيح",
    sales_section: "المبيعات", category_col: "الفئة", price_col: "السعر", labor_col: "الأجرة", gram_col: "الوزن",
    select_category_ph: "اختر الفئة…", total_label: "الإجمالي", discount_label: "الخصم",
    add_row: "+ إضافة صف", clear: "مسح", payments_section: "المدفوعات",
    method_col: "الطريقة", gold21k_col: "ذهب عيار 21", notes_col: "ملاحظات",
    select_method_ph: "اختر الطريقة…", method_bars: "سبائك", method_scrap: "خردة", method_money: "نقدًا", method_transfer: "تحويل",
    wt_g_ph: "الوزن (غ)", karat_ph: "العيار", money_ph: "المبلغ", gold_price_ph: "سعر الذهب",
    total_paid: "إجمالي المدفوع", saving: "جارٍ الحفظ…", deleting: "جارٍ الحذف…", print: "طباعة",
    foot_note: "الأسعار قابلة للتغيير حسب سعر الذهب اليومي",
    delete_row_title: "حذف الصف",
    clear_rows_confirm: "مسح جميع الصفوف؟", clear_payments_confirm: "مسح جميع صفوف الدفع؟",
    delete_receipt_confirm: "حذف هذا الإيصال؟ لا يمكن التراجع عن هذا.",
    saved_posted: "تم الحفظ والترحيل إلى العميل", saved_unlinked: "تم الحفظ (غير مرتبط بعميل)",
    saved_posting_failed: "تم الحفظ، لكن الترحيل إلى العميل فشل — حاول مرة أخرى",
    save_failed: "فشل الحفظ", delete_failed: "فشل الحذف",
    reviews: "المراجعات", assets_liabilities: "الأصول والالتزامات", sales: "المبيعات",
    gold_section: "ذهب", wages_section: "أجور", owed_to_you_card: "مستحق لك", you_owe_card: "أنت مدين",
    clients_checked: "تم فحص {n} عميل/عملاء", error_label: " — خطأ: {e}",
    sales_desc: "إجمالي الذهب والأجور المأخوذة من العملاء، حسب الشهر", no_sales_yet: "لا توجد مبيعات مسجلة بعد.",
    gold_sold: "الذهب المباع", wages_sold: "الأجور المباعة",
    transactions: "المعاملات",
    transactions_desc: "اختر نطاقًا زمنيًا لعرض حركات الذهب والأجور لكل عميل خلال تلك الفترة — بما في ذلك الإيصالات غير المرتبطة بعميل.",
    unlinked_tag: "إيصال غير مرتبط", no_transactions: "لا توجد حركات في هذه الفترة.",
  },
};

const LanguageContext = createContext({
  lang: "en",
  dir: "ltr",
  t: (key, vars) => {
    let s = translations.en[key] || key;
    if (vars) Object.keys(vars).forEach((k) => { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  },
  toggleLang: () => {},
});

function useLang() {
  return useContext(LanguageContext);
}

function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("app-language", false);
        if (res && (res.value === "ar" || res.value === "en")) setLang(res.value);
      } catch (e) {
        // no saved preference yet
      }
    })();
  }, []);

  const setLangDirect = useCallback((next) => {
    setLang(next);
    window.storage.set("app-language", next, false).catch(() => {});
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "ar" : "en";
      window.storage.set("app-language", next, false).catch(() => {});
      return next;
    });
  }, []);

  const t = useCallback(
    (key, vars) => {
      let s = (translations[lang] && translations[lang][key]) || translations.en[key] || key;
      if (vars) Object.keys(vars).forEach((k) => { s = s.replace("{" + k + "}", vars[k]); });
      return s;
    },
    [lang]
  );

  // Layout always stays left-to-right — only the words themselves switch
  // to Arabic. Numbers/dates/money already stay English via toEnglishDigits
  // and the locale-less toLocaleString calls in money()/grams().
  const dir = "ltr";

  return (
    <LanguageContext.Provider value={{ lang, t, dir, toggleLang, setLangDirect }}>
      {children}
    </LanguageContext.Provider>
  );
}

const langToggleBtnStyle = {
  position: "absolute",
  top: "1.25rem",
  left: "1rem",
  background: "#232019",
  border: "1px solid #3A3527",
  borderRadius: 8,
  padding: "0.35rem 0.7rem",
  color: "#C9A227",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  zIndex: 5,
};

const langMenuStyle = {
  position: "absolute",
  top: "2.65rem",
  left: "1rem",
  background: "#232019",
  border: "1px solid #3A3527",
  borderRadius: 8,
  overflow: "hidden",
  zIndex: 6,
  minWidth: 110,
};

const langMenuItemStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  background: "transparent",
  border: "none",
  padding: "0.55rem 0.7rem",
  color: "#F3EEE3",
  fontSize: 13,
  cursor: "pointer",
};


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
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

// Recomputes a saved receipt's sale/payment totals from its raw items and
// payments — used by the Transactions report for statements that aren't
// linked to a client (so there's no posted ledger entry to read instead).
function receiptTotals(data) {
  const items = data.items || [];
  const payments = data.payments || [];
  const totalGold = items.reduce((s, r) => s + (parseFloat(toEnglishDigits(r.gram)) || 0), 0);
  const totalLabor = items.reduce((s, r) => s + (parseFloat(toEnglishDigits(r.labor)) || 0), 0);
  const discountAmount = parseFloat(toEnglishDigits(data.discount)) || 0;
  const netLabor = totalLabor - discountAmount;
  const totalPaymentLabor = payments.reduce((s, r) => s + (parseFloat(toEnglishDigits(r.labor)) || 0), 0);
  const totalPaymentGold21k = payments.reduce((s, r) => s + (parseFloat(toEnglishDigits(r.gold21k)) || 0), 0);
  return { totalGold, netLabor, totalPaymentGold21k, totalPaymentLabor };
}

// Removes previously-posted statement ledger entries (by id) from a
// client's gold/wages arrays. Used when a statement tied to a client is
// deleted, or re-saved (so the old amounts don't linger alongside new ones).
// Throws on failure instead of swallowing it, so a failed write never gets
// mistaken for a successful one by the caller.
async function removePostedEntries(clientId, posted) {
  if (!clientId || !posted) return;
  const idsToRemove = new Set(
    [posted.goldSaleId, posted.goldPaymentId, posted.wageSaleId, posted.wagePaymentId].filter(Boolean)
  );
  if (idsToRemove.size === 0) return;
  const data = await fetchLedgerFor(clientId);
  const next = {
    ...data,
    gold: data.gold.filter((e) => !idsToRemove.has(e.id)),
    wages: data.wages.filter((e) => !idsToRemove.has(e.id)),
  };
  const result = await window.storage.set("ledger:" + clientId, JSON.stringify(next), false);
  if (!result) {
    throw new Error("Failed to update ledger for client " + clientId);
  }
}

// Posts a statement's sale/payment totals into a client's gold and wages
// ledgers as up to four dated entries (sale grams/labor add to balance,
// payment 21k-gold/labor subtract from it), returning the new entries'
// ids so they can be found and reversed later if the statement changes.
// Throws on failure instead of returning as if it succeeded.
async function postStatementToClient(clientId, statementNo, dateStr, totals) {
  const { totalGold, netLabor, totalPaymentGold21k, totalPaymentLabor } = totals;
  const data = await fetchLedgerFor(clientId);
  const gold = [...data.gold];
  const wages = [...data.wages];
  const posted = { clientId };

  // A client with any named book (e.g. "2026") no longer treats an
  // untagged entry as belonging to it — only entries explicitly tagged
  // with that book id show up there. So a new entry has to be tagged
  // with whatever book is actually active for this client (the newest
  // one, same rule the client screen itself uses), or it silently lands
  // in a book nobody is looking at. A client with no named books yet has
  // no such book to match, so the entry is left untagged as before.
  const goldBooks = Array.from(new Set([...distinctBooks(data.gold), ...((data.extraBooks && data.extraBooks.gold) || [])]))
    .sort()
    .reverse();
  const wageBooks = Array.from(new Set([...distinctBooks(data.wages), ...((data.extraBooks && data.extraBooks.wages) || [])]))
    .sort()
    .reverse();
  const activeGoldBook = goldBooks[0] || null;
  const activeWageBook = wageBooks[0] || null;

  if (totalGold) {
    const entry = {
      id: uid(),
      amount: totalGold,
      date: dateStr,
      note: `Statement #${statementNo} — sale`,
      ...(activeGoldBook ? { book: activeGoldBook } : {}),
    };
    gold.unshift(entry);
    posted.goldSaleId = entry.id;
  }
  if (totalPaymentGold21k) {
    const entry = {
      id: uid(),
      amount: -totalPaymentGold21k,
      date: dateStr,
      note: `Statement #${statementNo} — payment`,
      ...(activeGoldBook ? { book: activeGoldBook } : {}),
    };
    gold.unshift(entry);
    posted.goldPaymentId = entry.id;
  }
  if (netLabor) {
    const entry = {
      id: uid(),
      amount: netLabor,
      date: dateStr,
      note: `Statement #${statementNo} — sale`,
      ...(activeWageBook ? { book: activeWageBook } : {}),
    };
    wages.unshift(entry);
    posted.wageSaleId = entry.id;
  }
  if (totalPaymentLabor) {
    const entry = {
      id: uid(),
      amount: -totalPaymentLabor,
      date: dateStr,
      note: `Statement #${statementNo} — payment`,
      ...(activeWageBook ? { book: activeWageBook } : {}),
    };
    wages.unshift(entry);
    posted.wagePaymentId = entry.id;
  }

  const result = await window.storage.set("ledger:" + clientId, JSON.stringify({ ...data, gold, wages }), false);
  if (!result) {
    throw new Error("Failed to write ledger for client " + clientId);
  }

  // Read the ledger back and confirm the new entries are actually there —
  // a write can report success without the data really sticking (stale
  // client id, eventual-consistency lag, etc.), and that's indistinguishable
  // from a real failure unless we check.
  const expectedIds = [posted.goldSaleId, posted.goldPaymentId, posted.wageSaleId, posted.wagePaymentId].filter(Boolean);
  if (expectedIds.length > 0) {
    const verify = await fetchLedgerFor(clientId);
    const allIds = new Set([...(verify.gold || []), ...(verify.wages || [])].map((e) => e.id));
    const missing = expectedIds.some((id) => !allIds.has(id));
    if (missing) {
      throw new Error("Ledger write for client " + clientId + " did not persist");
    }
  }

  return posted;
}

function ClientsTab() {
  const { t, dir } = useLang();
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
      setAddError(t("enter_client_name"));
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
      setCategoryError(t("enter_category_name"));
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
      setCategoryEditError(t("enter_category_name"));
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
        <span style={{ color: "#8B7355" }}>{t("loading_ledger")}</span>
      </div>
    );
  }

  const active = (customers || []).find((c) => c.id === activeId);

  return (
    <div style={styles.wrap} dir={dir}>
      {fontLink}
      <h2 className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
        {t("sr_ledger_desc")}
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
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const filteredCustomers = search.trim()
    ? customers.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))
    : customers;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 0.3, color: "#8B7355", marginBottom: 2 }}>{t("client_ledger_label")}</div>
          <h1 style={{ ...styles.display, fontSize: 28, fontWeight: 600, margin: 0, color: "#F3EEE3" }}>{t("your_clients")}</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBackup} style={smallBtn}>
            {t("backup")}
          </button>
          <button onClick={onManageCategories} style={smallBtn}>
            {t("categories")}
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
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, color: "#C9A227" }}>{t("add_a_client")}</div>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("client_name_ph")}
            style={inputStyle}
            autoFocus
          />
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder={t("phone_optional_ph")}
            style={{ ...inputStyle, marginTop: 8 }}
          />
          {addError && <div style={{ color: "#D4756B", fontSize: 13, marginTop: 6 }}>{addError}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={onAdd} style={{ ...primaryBtn, flex: 1 }}>
              {t("add_client")}
            </button>
            <button onClick={() => setShowAddForm(false)} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)} style={{ ...primaryBtn, width: "100%", marginBottom: "1.5rem" }}>
          {t("add_new_client")}
        </button>
      )}

      {customers.length > 0 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search_clients_ph")}
          style={{ ...inputStyle, marginBottom: 12 }}
        />
      )}

      {customers.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          {t("no_clients_yet")}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          {t("no_clients_match", { q: search.trim() })}
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
                        {t("gold_amount", { v: grams(bal.gold) })}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: bal.wages > 0 ? "#D4756B" : bal.wages < 0 ? "#7FAE7A" : "#8B7355" }}>
                        {t("wages_amount", { v: money(bal.wages) })}
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
  const { t } = useLang();
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
      setDailyStatus(t("restored_success", { d: dateStr }));
      setConfirmingDaily(null);
    } catch (e) {
      setDailyStatus(t("restore_failed_daily"));
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyStatus(t("copied"));
    } catch (e) {
      setCopyStatus(t("copy_failed"));
    }
    setTimeout(() => setCopyStatus(""), 2500);
  }

  async function handleRestore() {
    setImportStatus("");
    try {
      await restoreFromBackup(importText);
      setImportStatus(t("restored_successfully"));
      setConfirmingImport(false);
    } catch (e) {
      setImportStatus(t("restore_failed_invalid"));
    }
  }

  return (
    <div>
      <button onClick={onBack} style={backBtn}>
        {t("all_clients")}
      </button>

      <h1 style={{ ...styles.display, fontSize: 24, fontWeight: 600, margin: "0 0 1rem", color: "#F3EEE3" }}>{t("backup_restore")}</h1>

      <div style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 12, padding: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: "#C9A227" }}>{t("export_your_data")}</div>
        <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 10 }}>
          {t("export_desc")}
        </div>
        {exportLoading ? (
          <div style={{ color: "#8B7355", fontSize: 13 }}>{t("preparing_backup")}</div>
        ) : (
          <>
            <textarea
              readOnly
              value={exportText}
              onFocus={(e) => e.target.select()}
              style={{ ...inputStyle, height: 160, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
            />
            <button onClick={handleCopy} style={{ ...primaryBtn, marginTop: 10, width: "100%" }}>
              {copyStatus || t("copy_backup")}
            </button>
            <button onClick={handleDownload} style={{ ...smallBtn, marginTop: 8, width: "100%", textAlign: "center" }}>
              {t("save_to_file")}
            </button>
          </>
        )}
      </div>

      <div style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 12, padding: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: "#C9A227" }}>{t("daily_backups")}</div>
        <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 10 }}>
          {t("daily_backups_desc")}
        </div>
        {dailyLoading ? (
          <div style={{ color: "#8B7355", fontSize: 13 }}>{t("loading")}</div>
        ) : dailyBackups.length === 0 ? (
          <div style={{ color: "#8B7355", fontSize: 13 }}>{t("no_daily_backups")}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {dailyBackups.map((dateStr) =>
              confirmingDaily === dateStr ? (
                <div key={dateStr} style={{ background: "#1C1913", border: "1px solid #D4756B", borderRadius: 8, padding: "0.6rem 0.75rem" }}>
                  <div style={{ fontSize: 13, color: "#D4756B", marginBottom: 8 }}>
                    {t("restore_daily_confirm", { d: dateStr })}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleRestoreDaily(dateStr)} style={{ ...primaryBtn, background: "#D4756B", color: "#1C1913", flex: 1 }}>
                      {t("yes_restore")}
                    </button>
                    <button onClick={() => setConfirmingDaily(null)} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                      {t("cancel")}
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
                    {t("restore")}
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
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: "#C9A227" }}>{t("restore_from_backup")}</div>
        <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 10 }}>
          {t("restore_desc")}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt,application/json,text/plain"
          onChange={handleFileSelected}
          style={{ display: "none" }}
        />
        <button onClick={handleUploadClick} style={{ ...smallBtn, width: "100%", textAlign: "center", marginBottom: 10 }}>
          {t("upload_backup_file")}
        </button>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={t("paste_backup_ph")}
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
              {t("overwrite_confirm")}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleRestore} style={{ ...primaryBtn, background: "#D4756B", color: "#1C1913", flex: 1 }}>
                {t("yes_restore")}
              </button>
              <button onClick={() => setConfirmingImport(false)} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                {t("cancel")}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingImport(true)}
            disabled={!importText.trim()}
            style={{ ...primaryBtn, marginTop: 10, width: "100%", opacity: importText.trim() ? 1 : 0.5 }}
          >
            {t("restore_this_backup")}
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
  const { t } = useLang();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  return (
    <div>
      <button onClick={onBack} style={backBtn}>
        {t("all_clients")}
      </button>

      <h1 style={{ ...styles.display, fontSize: 26, fontWeight: 600, margin: "0 0 1rem", color: "#F3EEE3" }}>
        {t("jewelry_categories")}
      </h1>
      <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 16 }}>
        {t("categories_desc")}
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
            placeholder={t("category_ph")}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={onAdd} style={primaryBtn}>
            {t("add")}
          </button>
        </div>
        {categoryError && <div style={{ color: "#D4756B", fontSize: 13, marginTop: 6 }}>{categoryError}</div>}
      </div>

      {categories.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          {t("no_categories_yet")}
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
                        {t("save")}
                      </button>
                      <button onClick={onCancelEdit} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 14 }}>{cat.name}</div>
                    {confirmDeleteId === cat.id ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#D4756B" }}>{t("delete_q")}</span>
                        <button
                          onClick={() => {
                            onDelete(cat.id);
                            setConfirmDeleteId(null);
                          }}
                          style={{ background: "#D4756B", border: "none", borderRadius: 6, color: "#1C1913", cursor: "pointer", padding: "4px 10px", fontSize: 13, fontWeight: 500 }}
                        >
                          {t("yes")}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 6, color: "#8B7355", cursor: "pointer", padding: "4px 10px", fontSize: 13 }}
                        >
                          {t("cancel")}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          onClick={() => onStartEdit(cat)}
                          style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 6, color: "#C9A227", cursor: "pointer", padding: "4px 10px", fontSize: 13 }}
                        >
                          {t("edit")}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(cat.id)}
                          style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 6, color: "#D4756B", cursor: "pointer", padding: "4px 10px", fontSize: 13 }}
                        >
                          {t("delete")}
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
  const { t } = useLang();
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
      setNameError(t("enter_client_name"));
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
        {t("all_clients")}
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
                  {t("save")}
                </button>
                <button onClick={cancelEditName} style={smallBtn}>
                  {t("cancel")}
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
                  {t("edit")}
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
            aria-label={t("contact_info")}
            style={{ ...smallBtn, width: 38, height: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <CardIcon />
          </button>
          <button onClick={() => setTab("prices")} style={smallBtn}>
            {t("price_list")}
          </button>
        </div>
      </div>

      {contactOpen && (
        <div style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 10, padding: "0.85rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 8 }}>{t("contact_info")}</div>
          <input
            value={phoneDraft}
            onChange={(e) => setPhoneDraft(e.target.value)}
            placeholder={t("phone_number_ph")}
            style={inputStyle}
          />
          <input
            value={addressDraft}
            onChange={(e) => setAddressDraft(e.target.value)}
            placeholder={t("address_ph")}
            style={{ ...inputStyle, marginTop: 8 }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={saveContact} style={{ ...primaryBtn, flex: 1 }}>
              {t("save")}
            </button>
            <button onClick={cancelContact} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
        <BalanceCard label={t("tab_gold")} value={grams(balances.gold)} tone={balances.gold} />
        <BalanceCard label={t("tab_wages")} value={money(balances.wages)} tone={balances.wages} />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", borderBottom: "1px solid #3A3527" }}>
        {[
          { id: "gold", label: t("tab_gold") },
          { id: "wages", label: t("tab_wages") },
          { id: "review", label: t("tab_review") },
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
            title={t("tab_gold")}
            takeLabel={t("took_gold")}
            returnLabel={t("gave_back")}
            emptyText={t("no_gold_entries")}
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
            title={t("tab_wages")}
            takeLabel={t("took_wages")}
            returnLabel={t("paid_back_label")}
            emptyText={t("no_wage_entries")}
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
        <ReviewTabContent goldEntries={ledger.gold} wageEntries={ledger.wages} />
      )}

      {tab === "prices" && (
        <PriceListSection categories={categories} prices={ledger.prices || {}} onChange={setClientPrice} onManageCategories={onManageCategories} />
      )}

      <RemoveClientControl customerName={customer.name} onConfirm={onDeleteCustomer} />
    </div>
  );
}

function RemoveClientControl({ customerName, onConfirm }) {
  const { t } = useLang();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 13, color: "#D4756B", marginBottom: 8 }}>
          {t("remove_client_confirm", { name: customerName })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onConfirm} style={{ ...primaryBtn, background: "#D4756B", color: "#1C1913" }}>
            {t("yes_remove")}
          </button>
          <button onClick={() => setConfirming(false)} style={smallBtn}>
            {t("cancel")}
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
      {t("remove_this_client")}
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

function bookLabel(book, t) {
  return book === "current" ? t("current_book") : book;
}

function BookSelector({ books, active, onSelect, onAddBook, onDeleteBook }) {
  const { t } = useLang();
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
      setAddError(t("enter_book_name"));
      return;
    }
    if (name === "current" || books.includes(name)) {
      setAddError(t("book_already_exists"));
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
              {bookLabel(b, t)}
            </button>
          ))}
        </div>
        <button
          onClick={() => (menuOpen ? closeAll() : setMenuOpen(true))}
          aria-label={t("book_options")}
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
                {t("add_new_book")}
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
                {t("delete_book_named", { b: bookLabel(active, t) })}
              </button>
            </div>
          )}

          {adding && (
            <div>
              <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 8 }}>
                {t("book_hint")}
              </div>
              <input
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder={t("book_name_ph")}
                style={inputStyle}
                autoFocus
              />
              {addError && <div style={{ color: "#D4756B", fontSize: 13, marginTop: 6 }}>{addError}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={submitAddBook} style={{ ...primaryBtn, flex: 1 }}>
                  {t("add_book")}
                </button>
                <button onClick={closeAll} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                  {t("cancel")}
                </button>
              </div>
            </div>
          )}

          {confirmingDelete && (
            <div>
              <div style={{ fontSize: 13, color: "#D4756B", marginBottom: 8 }}>
                {t("delete_book_confirm", { b: bookLabel(active, t) })}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={confirmDelete} style={{ ...primaryBtn, background: "#D4756B", color: "#1C1913", flex: 1 }}>
                  {t("yes_delete")}
                </button>
                <button onClick={closeAll} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                  {t("cancel")}
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
  const { t } = useLang();
  const total = (entries || []).reduce((s, e) => s + e.amount, 0);
  const color = total > 0 ? "#D4756B" : total < 0 ? "#7FAE7A" : "#8B7355";
  return (
    <div style={{ fontSize: 12.5, color: "#8B7355", marginBottom: 10 }}>
      {t("balance_for_book", { v: "" })}<span style={{ color, fontWeight: 500 }}>{formatAmount(total)}</span>
    </div>
  );
}

function BalanceCard({ label, value, tone }) {
  const { t } = useLang();
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
        {tone > 0 ? t("owed_to_you") : tone < 0 ? t("owed_to_client") : t("settled")}
      </div>
    </div>
  );
}

function CustomStatCard({ label, value, color }) {
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

const bigActivityBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "1.1rem",
  fontFamily: "'Fraunces', serif",
  fontSize: 17,
  fontWeight: 600,
  color: "#F3EEE3",
  background: "#232019",
  border: "1px solid #3A3527",
  borderRadius: 12,
  cursor: "pointer",
};

function ReviewTabContent({ goldEntries, wageEntries }) {
  const { t } = useLang();
  const [view, setView] = useState(null); // null | "activity" | "custom"

  if (!view) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => setView("activity")} style={bigActivityBtn}>
          {t("activity")}
        </button>
        <button onClick={() => setView("custom")} style={bigActivityBtn}>
          {t("custom_activity")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setView(null)} style={backBtn}>
        {t("back")}
      </button>
      {view === "activity" && <ReviewSection goldEntries={goldEntries} wageEntries={wageEntries} />}
      {view === "custom" && <CustomActivitySection goldEntries={goldEntries} wageEntries={wageEntries} />}
    </div>
  );
}

function CustomActivitySection({ goldEntries, wageEntries }) {
  const { t } = useLang();
  const [fromDate, setFromDate] = useState(todayStr());
  const [toDate, setToDate] = useState(todayStr());

  function totalsFor(entries) {
    const inRange = (entries || []).filter((e) => e.date && e.date >= fromDate && e.date <= toDate);
    const taken = inRange.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
    const paid = inRange.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);
    return { taken, paid };
  }

  const goldTotals = totalsFor(goldEntries);
  const wageTotals = totalsFor(wageEntries);

  return (
    <div>
      <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 14 }}>
        {t("custom_activity_desc")}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#8B7355", marginBottom: 4 }}>{t("from_label")}</div>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#8B7355", marginBottom: 4 }}>{t("to_label")}</div>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 500, color: "#F3EEE3", marginBottom: 8 }}>{t("tab_gold")}</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <CustomStatCard label={t("taken")} value={grams(goldTotals.taken)} color="#D4756B" />
        <CustomStatCard label={t("paid_back_stat")} value={grams(goldTotals.paid)} color="#7FAE7A" />
      </div>

      <div style={{ fontSize: 15, fontWeight: 500, color: "#F3EEE3", marginBottom: 8 }}>{t("tab_wages")}</div>
      <div style={{ display: "flex", gap: 10 }}>
        <CustomStatCard label={t("taken")} value={money(wageTotals.taken)} color="#D4756B" />
        <CustomStatCard label={t("paid_back_stat")} value={money(wageTotals.paid)} color="#7FAE7A" />
      </div>
    </div>
  );
}

function ReviewSection({ goldEntries, wageEntries }) {
  const { t } = useLang();
  const goldRows = buildMonthlyReview(goldEntries);
  const wageRows = buildMonthlyReview(wageEntries);

  return (
    <div>
      <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 14 }}>
        {t("review_desc")}
      </div>
      <ReviewTable title={t("tab_gold")} rows={goldRows} formatAmount={grams} emptyText={t("no_gold_history")} />
      <div style={{ height: 20 }} />
      <ReviewTable title={t("tab_wages")} rows={wageRows} formatAmount={money} emptyText={t("no_wage_history")} />
    </div>
  );
}

function ReviewTable({ title, rows, formatAmount, emptyText }) {
  const { t } = useLang();
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
                  <div style={{ fontSize: 11, color: "#8B7355" }}>{t("owed_at_start")}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: r.owedAtStart > 0 ? "#D4756B" : "#8B7355" }}>
                    {formatAmount(r.owedAtStart)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#8B7355" }}>{t("paid_back_by_end")}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#7FAE7A" }}>{formatAmount(r.paidThisMonth)}</div>
                </div>
              </div>
              {r.late && (
                <div style={{ fontSize: 12, color: "#D4756B", marginTop: 6 }}>
                  {t("late_outstanding", { v: formatAmount(r.owedAtStart - r.paidThisMonth) })}
                </div>
              )}
              {r.takenLaterThisMonth > 0 && (
                <div style={{ fontSize: 12, color: "#8B7355", marginTop: 6 }}>
                  {t("taken_later", { v: formatAmount(r.takenLaterThisMonth) })}
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
  const { t } = useLang();
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
        {t("no_jewelry_categories")}
        <div style={{ marginTop: 10 }}>
          <button onClick={onManageCategories} style={smallBtn}>
            {t("add_categories")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 10 }}>
        {t("set_wage_price_desc")}
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
        {t("edit_categories")}
      </button>
    </div>
  );
}

function LedgerSection({ title, takeLabel, returnLabel, emptyText, entries, kind, formatAmount, onAdd, onEdit, onDelete, entryForm, setEntryForm, submitEntry }) {
  const { t } = useLang();
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
          {t("add")}
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
              inputMode="decimal"
              value={entryForm.amount}
              onChange={(e) => setEntryForm((f) => ({ ...f, amount: toEnglishDigits(e.target.value) }))}
              placeholder={kind === "gold" ? t("grams_ph") : t("amount_ph")}
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
            placeholder={t("note_optional_ph")}
            style={{ ...inputStyle, marginTop: 8 }}
          />
          {entryForm.error && <div style={{ color: "#D4756B", fontSize: 13, marginTop: 6 }}>{entryForm.error}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={submitEntry} style={{ ...primaryBtn, flex: 1 }}>
              {isEditing ? t("update") : t("save")}
            </button>
            <button
              onClick={() => {
                setEntryForm({ open: null, direction: "take", amount: "", date: todayStr(), note: "", error: "", editId: null });
                setFormConfirmDelete(false);
              }}
              style={{ ...smallBtn, flex: 1, textAlign: "center" }}
            >
              {t("cancel")}
            </button>
          </div>
          {isEditing && (
            <div style={{ marginTop: 10 }}>
              {formConfirmDelete ? (
                <div>
                  <div style={{ fontSize: 13, color: "#D4756B", marginBottom: 6 }}>{t("delete_entry_confirm")}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => {
                        onDelete(entryForm.editId);
                        setEntryForm({ open: null, direction: "take", amount: "", date: todayStr(), note: "", error: "", editId: null });
                        setFormConfirmDelete(false);
                      }}
                      style={{ ...primaryBtn, flex: 1, background: "#D4756B", color: "#1C1913" }}
                    >
                      {t("yes_delete")}
                    </button>
                    <button onClick={() => setFormConfirmDelete(false)} style={{ ...smallBtn, flex: 1, textAlign: "center" }}>
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setFormConfirmDelete(true)}
                  style={{ background: "transparent", border: "none", color: "#D4756B", fontSize: 13, cursor: "pointer", padding: 0 }}
                >
                  {t("delete_this_entry")}
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
                    <div style={{ fontSize: 11, color: "#8B7355" }}>{t("balance")}</div>
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
                        <div style={{ fontSize: 13, color: "#D4756B", marginBottom: 6 }}>{t("delete_entry_confirm")}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              onDelete(e.id);
                            }}
                            style={{ background: "#D4756B", border: "none", borderRadius: 6, color: "#1C1913", cursor: "pointer", padding: "6px 12px", fontSize: 13, fontWeight: 500, flex: 1 }}
                          >
                            {t("yes_delete")}
                          </button>
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            style={{ ...smallBtn, flex: 1, textAlign: "center" }}
                          >
                            {t("cancel")}
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
                          {t("edit")}
                        </button>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setConfirmDeleteId(e.id);
                          }}
                          style={{ background: "#232019", border: "1px solid #3A3527", borderRadius: 6, color: "#D4756B", cursor: "pointer", padding: "4px 10px", fontSize: 13 }}
                        >
                          {t("delete")}
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
  const { t } = useLang();
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
      <div style={{ fontSize: 14 }}>{t("coming_soon")}</div>
    </div>
  );
}

function ReceiptsTab() {
  const { t } = useLang();
  const [view, setView] = useState(null); // null | "create" | "view-list"
  const [openReceiptId, setOpenReceiptId] = useState(null);

  if (view === "create") {
    return (
      <div>
        <button
          onClick={() => {
            setView(null);
            setOpenReceiptId(null);
          }}
          style={backBtn}
        >
          &larr; {t("receipts")}
        </button>
        <CreateReceiptScreen
          receiptId={openReceiptId}
          onDeleted={() => {
            setOpenReceiptId(null);
            setView("view-list");
          }}
        />
      </div>
    );
  }

  if (view === "view-list") {
    return (
      <div>
        <button onClick={() => setView(null)} style={backBtn}>
          &larr; {t("receipts")}
        </button>
        <ViewReceiptsScreen
          onOpenReceipt={(id) => {
            setOpenReceiptId(id);
            setView("create");
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#F3EEE3", marginBottom: 16 }}>
        {t("receipts")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={() => {
            setOpenReceiptId(null);
            setView("create");
          }}
          style={bigHomeBtn}
        >
          {t("create_receipt")}
        </button>
        <button onClick={() => setView("view-list")} style={bigHomeBtn}>
          {t("view_receipts")}
        </button>
      </div>
    </div>
  );
}

// Lists every saved statement/receipt, newest first (by date, then by
// statement number as a tiebreaker), pulled from the "receipts-list" index.
function ViewReceiptsScreen({ onOpenReceipt }) {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let list = [];
      try {
        const res = await window.storage.get("receipts-list", false);
        list = res ? JSON.parse(res.value) : [];
      } catch (e) {
        list = [];
      }
      const sorted = [...list].sort((a, b) => {
        const dateCmp = (b.date || "").localeCompare(a.date || "");
        if (dateCmp !== 0) return dateCmp;
        return (b.statementNo || "").localeCompare(a.statementNo || "", undefined, { numeric: true });
      });
      if (!cancelled) {
        setReceipts(sorted);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>{t("loading")}</div>;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#F3EEE3", marginBottom: 16 }}>
        {t("saved_receipts")}
      </div>
      {receipts.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          {t("no_receipts_yet")}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {receipts.map((r) => (
            <button
              key={r.id}
              onClick={() => onOpenReceipt(r.id)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                textAlign: "left",
                background: "#232019",
                border: "1px solid #3A3527",
                borderRadius: 12,
                padding: "0.85rem 1rem",
                cursor: "pointer",
              }}
            >
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#F3EEE3" }}>
                  {r.clientName || t("unnamed_client")}
                </div>
                <div style={{ fontSize: 12, color: "#8B7355", marginTop: 2 }}>
                  {t("receipt_no_date", { no: r.statementNo || "—", date: r.date || t("no_date") })}
                  {r.note ? ` · ${r.note}` : ""}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#8B7355" }}>&rarr;</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const emptyItemRow = () => ({ id: uid(), category: "", price: "", labor: "", gram: "" });
const emptyPaymentRow = () => ({
  id: uid(),
  method: "",
  labor: "",
  gold21k: "",
  barWeight: "",
  barKarat: "",
  moneyAmount: "",
  goldPrice: "",
  note: "",
});

// 21k gold is 875 parts per 1000 pure. Converting a bar of a different
// purity into its 21k-equivalent weight: equivalent = weight * karat / 875.
// e.g. 100g at 854 karat -> 100 * 854 / 875 = 97.6g of 21k gold.
const KARAT_21K = 875;
function computeBarGold21k(weight, karat) {
  const w = parseFloat(toEnglishDigits(weight)) || 0;
  const k = parseFloat(toEnglishDigits(karat)) || 0;
  if (!w || !k) return "";
  return String(Math.round((w * k / KARAT_21K) * 100) / 100);
}

// Converts a cash amount into its 21k-gold equivalent at a given gold price
// (price = money per gram of 21k gold). e.g. 120000 / 6340 = 18.93g.
function computeMoneyGold21k(moneyAmount, goldPrice) {
  const m = parseFloat(toEnglishDigits(moneyAmount)) || 0;
  const p = parseFloat(toEnglishDigits(goldPrice)) || 0;
  if (!m || !p) return "";
  return String(Math.round((m / p) * 100) / 100);
}

function CreateReceiptScreen({ receiptId, onDeleted }) {
  const { t } = useLang();
  const [loadedId, setLoadedId] = useState(null); // id of the receipt currently loaded, if editing a saved one
  const [statementNo, setStatementNo] = useState("11872");
  const [day, setDay] = useState(() => todayStr().slice(8, 10));
  const [month, setMonth] = useState(() => todayStr().slice(5, 7));
  const [year, setYear] = useState(() => todayStr().slice(0, 4));
  const [note, setNote] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState(null);
  const [posted, setPosted] = useState(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState(() => Array.from({ length: 1 }, emptyItemRow));
  const [payments, setPayments] = useState(() => Array.from({ length: 1 }, emptyPaymentRow));
  const [discount, setDiscount] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveTone, setSaveTone] = useState("ok"); // "ok" | "warn" | "error"
  const [deleting, setDeleting] = useState(false);

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
      // For a brand-new statement (not one opened from View Receipts),
      // show the next number after whichever was last actually saved —
      // the counter itself only advances once this one is saved, so
      // closing without saving doesn't burn a number.
      if (!receiptId) {
        try {
          const res = await window.storage.get("statement-counter", false);
          const last = res ? parseInt(toEnglishDigits(res.value), 10) : NaN;
          const base = isNaN(last) ? 11871 : last;
          setStatementNo(String(base + 1));
        } catch (e) {
          // keep the default statementNo already in state
        }
      }
    })();
  }, []);

  // If opened from "View Receipts", load that saved statement's data in.
  useEffect(() => {
    if (!receiptId) return;
    (async () => {
      try {
        const res = await window.storage.get("receipt:" + receiptId, false);
        if (res) {
          const data = JSON.parse(res.value);
          setLoadedId(receiptId);
          setStatementNo(data.statementNo || "");
          setDay(data.day || todayStr().slice(8, 10));
          setMonth(data.month || todayStr().slice(5, 7));
          setYear(data.year || todayStr().slice(0, 4));
          setNote(data.note || "");
          setClientName(data.clientName || "");
          setClientId(data.clientId || null);
          setPosted(data.posted || null);
          setItems(data.items && data.items.length ? data.items : Array.from({ length: 1 }, emptyItemRow));
          setPayments(data.payments && data.payments.length ? data.payments : Array.from({ length: 1 }, emptyPaymentRow));
          setDiscount(data.discount || "");
        }
      } catch (e) {
        setSaveMessage(t("couldnt_load_receipt"));
      }
    })();
  }, [receiptId]);

  const filteredCustomers = clientName.trim()
    ? customers.filter((c) => c.name.toLowerCase().includes(clientName.trim().toLowerCase()))
    : customers;
  const linkedCustomerPhone = clientId ? (customers.find((c) => c.id === clientId) || {}).phone : null;

  const totalGold = items.reduce((s, r) => s + (parseFloat(toEnglishDigits(r.gram)) || 0), 0);
  const totalLabor = items.reduce((s, r) => s + (parseFloat(toEnglishDigits(r.labor)) || 0), 0);
  const discountAmount = parseFloat(toEnglishDigits(discount)) || 0;
  const netLabor = totalLabor - discountAmount;
  const totalPaymentLabor = payments.reduce((s, r) => s + (parseFloat(toEnglishDigits(r.labor)) || 0), 0);
  const totalPaymentGold21k = payments.reduce((s, r) => s + (parseFloat(toEnglishDigits(r.gold21k)) || 0), 0);

  function updateItem(id, field, value) {
    const v = field === "price" || field === "labor" || field === "gram" ? toEnglishDigits(value) : value;
    setItems((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, [field]: v };
        if (field === "gram" || field === "price") {
          const g = parseFloat(toEnglishDigits(next.gram)) || 0;
          const p = parseFloat(toEnglishDigits(next.price)) || 0;
          // Only auto-fill once there's an actual product to show — otherwise
          // leave it blank so typing a gram (with no price yet) doesn't dump
          // a "0" into Labor that has to be deleted before typing a real one.
          next.labor = g && p ? String(Math.round(g * p * 100) / 100) : "";
        }
        return next;
      })
    );
  }
  const paymentNumericFields = ["labor", "gold21k", "barWeight", "barKarat", "moneyAmount", "goldPrice"];
  function updatePayment(id, field, value) {
    const v = paymentNumericFields.includes(field) ? toEnglishDigits(value) : value;
    setPayments((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, [field]: v };
        if (field === "barWeight" || field === "barKarat") {
          next.gold21k = computeBarGold21k(next.barWeight, next.barKarat);
        }
        if (field === "moneyAmount" || field === "goldPrice") {
          next.gold21k = computeMoneyGold21k(next.moneyAmount, next.goldPrice);
        }
        return next;
      })
    );
  }
  function addItemRow() {
    setItems((prev) => [...prev, emptyItemRow()]);
  }
  function removeItemRow(id) {
    setItems((prev) => prev.filter((r) => r.id !== id));
  }
  function clearItems() {
    if (window.confirm(t("clear_rows_confirm"))) {
      setItems(Array.from({ length: 1 }, emptyItemRow));
    }
  }
  function addPaymentRow() {
    setPayments((prev) => [...prev, emptyPaymentRow()]);
  }
  function removePaymentRow(id) {
    setPayments((prev) => prev.filter((r) => r.id !== id));
  }
  function clearPayments() {
    if (window.confirm(t("clear_payments_confirm"))) {
      setPayments(Array.from({ length: 1 }, emptyPaymentRow));
    }
  }

  // Saves the statement to Supabase under "receipt:<id>", keeps a
  // lightweight index in "receipts-list", and — if a client is linked —
  // posts (or re-posts) the sale/payment totals into that client's ledger.
  async function saveStatement() {
    setSaving(true);
    setSaveMessage("");
    try {
      const isNewStatement = !loadedId;
      const id = loadedId || uid();
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      // Post the new amounts first, then clean up whatever was posted
      // before — in that order, so a failed post never leaves a client
      // with neither the old nor the new numbers recorded. If posting
      // fails, we fall back to the previous posted record untouched.
      let newPosted = null;
      let postingFailed = false;
      try {
        if (clientId) {
          newPosted = await postStatementToClient(clientId, statementNo, dateStr, {
            totalGold,
            netLabor,
            totalPaymentGold21k,
            totalPaymentLabor,
          });
        }
      } catch (e) {
        postingFailed = true;
        newPosted = posted || null;
      }
      if (!postingFailed && posted) {
        try {
          await removePostedEntries(posted.clientId, posted);
        } catch (e) {
          // The new amounts are safely posted; the old ones may linger as
          // a duplicate until the next successful save cleans them up.
          postingFailed = true;
        }
      }

      const data = {
        id,
        statementNo,
        day,
        month,
        year,
        date: dateStr,
        note,
        clientName,
        clientId,
        posted: newPosted,
        items,
        payments,
        discount,
        savedAt: new Date().toISOString(),
      };

      await window.storage.set("receipt:" + id, JSON.stringify(data), false);

      let list = [];
      try {
        const res = await window.storage.get("receipts-list", false);
        list = res ? JSON.parse(res.value) : [];
      } catch (e) {
        list = [];
      }
      const withoutThis = list.filter((r) => r.id !== id);
      const indexEntry = { id, statementNo, clientName, date: dateStr, note, savedAt: data.savedAt };
      await window.storage.set("receipts-list", JSON.stringify([indexEntry, ...withoutThis]), false);

      // Advance the shared counter so the next brand-new statement gets a
      // fresh number — using whichever number this one actually saved
      // under (respecting a manual edit to the field, if any).
      if (isNewStatement) {
        const numeric = parseInt(toEnglishDigits(statementNo), 10);
        if (!isNaN(numeric)) {
          try {
            const counterRes = await window.storage.get("statement-counter", false);
            const current = counterRes ? parseInt(toEnglishDigits(counterRes.value), 10) : NaN;
            const newCounter = isNaN(current) ? numeric : Math.max(current, numeric);
            await window.storage.set("statement-counter", String(newCounter), false);
          } catch (e) {
            // best-effort; worst case the next new statement re-offers this number
          }
        }
      }

      setLoadedId(id);
      setPosted(newPosted);
      if (postingFailed) {
        setSaveTone("warn");
        setSaveMessage(t("saved_posting_failed"));
      } else {
        setSaveTone("ok");
        setSaveMessage(clientId ? t("saved_posted") : t("saved_unlinked"));
      }
    } catch (e) {
      setSaveTone("error");
      setSaveMessage(t("save_failed"));
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }

  // Deletes the whole saved statement — from "receipt:<id>", the
  // "receipts-list" index, and (if it was linked) the entries it posted
  // into a client's ledger — and hands control back to the caller.
  async function deleteStatement() {
    if (!loadedId) return;
    if (!window.confirm(t("delete_receipt_confirm"))) return;
    setDeleting(true);
    try {
      if (posted) {
        await removePostedEntries(posted.clientId, posted);
      }
      try {
        await window.storage.delete("receipt:" + loadedId, false);
      } catch (e) {
        // key may already be gone; proceed to clean up the index anyway
      }
      let list = [];
      try {
        const res = await window.storage.get("receipts-list", false);
        list = res ? JSON.parse(res.value) : [];
      } catch (e) {
        list = [];
      }
      await window.storage.set(
        "receipts-list",
        JSON.stringify(list.filter((r) => r.id !== loadedId)),
        false
      );
      if (onDeleted) onDeleted();
    } catch (e) {
      setSaveTone("error");
      setSaveMessage(t("delete_failed"));
      setDeleting(false);
    }
  }

  return (
    <div>
      <style>{`
        .receipt-sheet{
          --paper:#faf7ee;
          --paper-edge:#efe9d6;
          --ink:#2a2419;
          --ink-soft:#6b6250;
          --line:#c9c0a4;
          --gold:#a9822f;
          --gold-deep:#7c5e22;
          --red:#a3272c;
          width:100%;
          background:var(--paper);
          border:1px solid var(--paper-edge);
          box-shadow:0 2px 4px rgba(0,0,0,.06), 0 18px 40px rgba(30,25,10,.18);
          position:relative;
          font-family:'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif;
          color:var(--ink);
          box-sizing:border-box;
        }
        .receipt-sheet *{ box-sizing:border-box; }
        .receipt-sheet::before{
          content:"";
          position:absolute;
          top:0; left:0; right:0;
          height:14px;
          background:repeating-linear-gradient(90deg,#e2d9b8 0 26px,#d8cca0 26px 28px);
          opacity:.55;
        }
        .receipt-sheet .inner{ padding:38px 34px 30px; }
        .receipt-sheet .head{ display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:6px; }
        .receipt-sheet .mark{ width:84px; display:flex; flex-direction:column; align-items:flex-start; color:var(--gold-deep); padding-top:10px; }
        .receipt-sheet .brand-name{ font-size:13px; font-weight:700; letter-spacing:.1em; line-height:1.5; color:var(--gold-deep); }
        .receipt-sheet .title-block{ text-align:center; flex:1; }
        .receipt-sheet .title-block h1{ margin:8px 0 2px; font-size:30px; font-weight:600; letter-spacing:.08em; color:var(--ink); }
        .receipt-sheet .title-block .sub{ font-size:11px; color:var(--ink-soft); letter-spacing:.16em; font-style:italic; }
        .receipt-sheet .no-block{ width:64px; text-align:right; }
        .receipt-sheet .no-block .lbl{ font-size:9px; color:var(--ink-soft); letter-spacing:.1em; }
        .receipt-sheet .no-input{
          width:64px; border:none; background:transparent; color:var(--red);
          font-family:Georgia,serif; font-size:19px; font-weight:700; text-align:right;
          border-bottom:1px solid var(--line); padding:2px 0;
        }
        .receipt-sheet .no-input:focus{ outline:none; border-color:var(--gold); }
        .receipt-sheet hr.rule{ border:none; border-top:1px solid var(--line); margin:18px 0 16px; }
        .receipt-sheet .meta{ display:flex; flex-direction:column; gap:12px; margin-bottom:22px; }
        .receipt-sheet .meta-row{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }
        .receipt-sheet .meta-row label{ font-size:12px; color:var(--ink-soft); white-space:nowrap; letter-spacing:.03em; }
        .receipt-sheet .meta-row input, .receipt-sheet .meta-row select{
          flex:1; border:none; border-bottom:1px dotted var(--gold); background:transparent;
          font-family:inherit; font-size:14px; color:var(--ink); padding:3px 4px; min-width:60px;
        }
        .receipt-sheet .meta-row select{ appearance:none; -webkit-appearance:none; cursor:pointer; }
        .receipt-sheet .meta-row input:focus, .receipt-sheet .meta-row select:focus{ outline:none; border-bottom:1px solid var(--gold-deep); }
        .receipt-sheet .date-row input{ width:44px; text-align:center; flex:none; }
        .receipt-sheet .date-row .sep{ color:var(--ink-soft); }
        .receipt-sheet .client-field{ position:relative; flex:1; min-width:160px; }
        .receipt-sheet .client-field input{ width:100%; }
        .receipt-sheet .client-dropdown{
          position:absolute; top:100%; left:0; right:0; z-index:20;
          background:var(--paper, #fbf6e4); border:1px solid var(--line); border-top:none;
          max-height:260px; overflow-y:auto; box-shadow:0 6px 14px rgba(0,0,0,.12);
        }
        .receipt-sheet .client-dropdown-item{
          padding:8px 10px; font-size:14px; color:var(--ink); cursor:pointer; text-align:right;
        }
        .receipt-sheet .client-dropdown-item:hover, .receipt-sheet .client-dropdown-item:active{
          background:rgba(169,130,47,.12);
        }
        .receipt-sheet td select{
          width:100%; height:100%; border:none; background:transparent; font-family:inherit;
          font-size:13px; color:var(--ink); padding:0 6px; appearance:none; -webkit-appearance:none; cursor:pointer;
        }
        .receipt-sheet td select:focus{ outline:none; background:#fbf6e4; }
        .receipt-sheet tfoot tr.final-total-row td{ border-top:2.5px solid var(--ink); }
        .receipt-sheet table{ width:100%; border-collapse:collapse; border:1.5px solid var(--ink); }
        .receipt-sheet thead th{
          border:1px solid var(--ink); background:#f1ead2; font-size:11px; letter-spacing:.06em;
          color:var(--gold-deep); font-weight:700; padding:9px 4px; text-transform:uppercase;
        }
        .receipt-sheet th.col-item{ text-align:left; padding-left:12px; }
        .receipt-sheet tbody td{ border:1px solid var(--line); padding:0; height:30px; }
        .receipt-sheet tbody td input{
          width:100%; height:100%; border:none; background:transparent; font-family:inherit;
          font-size:13px; color:var(--ink); padding:0 8px; text-align:center;
        }
        .receipt-sheet td.col-item input{ text-align:left; }
        .receipt-sheet tbody td input:focus{ outline:none; background:#fbf6e4; }
        .receipt-sheet .row-del{
          width:100%; height:100%; border:none; background:transparent; cursor:pointer;
          color:var(--red); font-size:16px; font-weight:700; line-height:1;
        }
        .receipt-sheet .row-del:hover{ background:rgba(163,39,44,.1); }
        .receipt-sheet tbody tr:nth-child(even) td{ background:rgba(169,130,47,.035); }
        .receipt-sheet tfoot td{ border:1px solid var(--ink); padding:9px 8px; font-size:13px; }
        .receipt-sheet tfoot .total-label{
          text-align:right; font-weight:700; letter-spacing:.04em; color:var(--ink-soft);
          font-size:11px; text-transform:uppercase;
        }
        .receipt-sheet tfoot input{
          width:100%; border:none; background:transparent; font-family:inherit;
          font-weight:700; text-align:center; color:var(--red);
        }
        .receipt-sheet tfoot input:focus{ outline:none; }
        .receipt-sheet .section-divider{ border-top:2.5px solid var(--ink); margin:30px 0 20px; }
        .receipt-sheet .section-title{
          margin:0 0 12px; font-size:15px; font-weight:700; letter-spacing:.1em;
          color:var(--gold-deep); text-transform:uppercase;
        }
        .receipt-sheet .controls{ display:flex; justify-content:space-between; align-items:center; margin-top:16px; flex-wrap:wrap; gap:8px; }
        .receipt-sheet .rbtn{
          font-family:inherit; font-size:12px; letter-spacing:.04em; padding:7px 14px;
          border:1px solid var(--gold-deep); background:transparent; color:var(--gold-deep);
          cursor:pointer; border-radius:2px;
        }
        .receipt-sheet .rbtn:hover{ background:var(--gold-deep); color:var(--paper); }
        .receipt-sheet .rbtn.ghost{ border-color:var(--line); color:var(--ink-soft); }
        .receipt-sheet .rbtn.ghost:hover{ background:var(--ink-soft); color:var(--paper); border-color:var(--ink-soft); }
        .receipt-sheet .foot-note{ margin-top:26px; text-align:center; font-size:10.5px; color:var(--ink-soft); font-style:italic; letter-spacing:.03em; }
        @media print{
          .receipt-sheet{ box-shadow:none; border:none; max-width:none; }
          .receipt-sheet .controls{ display:none; }
        }
        @media (max-width:480px){
          .receipt-sheet .inner{ padding:24px 16px 18px; }
          .receipt-sheet .title-block h1{ font-size:22px; }
          .receipt-sheet thead th{ font-size:9px; padding:6px 2px; }
          .receipt-sheet tbody td input, .receipt-sheet tfoot td{ font-size:11.5px; }
          .receipt-sheet tfoot td{ padding:7px 3px; }
          .receipt-sheet tfoot input{ font-size:11px; letter-spacing:-.02em; }
        }
      `}</style>

      <div className="receipt-sheet">
        <div className="inner">
          <div className="head">
            <div className="mark">
              <span className="brand-name">MODERN<br />GOLD</span>
            </div>

            <div className="title-block">
              <h1>{t("statement")}</h1>
              <div className="sub">{t("order_details")}</div>
            </div>

            <div className="no-block">
              <div className="lbl">{t("no_label")}</div>
              <input className="no-input" inputMode="decimal" value={statementNo} onChange={(e) => setStatementNo(toEnglishDigits(e.target.value))} />
            </div>
          </div>

          <hr className="rule" />

          <div className="meta">
            <div className="meta-row date-row">
              <label>{t("date_label")}</label>
              <input placeholder="DD" inputMode="decimal" style={{ width: 34 }} value={day} onChange={(e) => setDay(toEnglishDigits(e.target.value))} />
              <span className="sep">/</span>
              <input placeholder="MM" inputMode="decimal" style={{ width: 34 }} value={month} onChange={(e) => setMonth(toEnglishDigits(e.target.value))} />
              <span className="sep">/</span>
              <input placeholder="YYYY" inputMode="decimal" style={{ width: 56 }} value={year} onChange={(e) => setYear(toEnglishDigits(e.target.value))} />
            </div>
            <div className="meta-row">
              <label>{t("note_label")}</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="meta-row">
              <label>{t("requested_from")}</label>
              <div className="client-field">
                <input
                  type="text"
                  value={clientName}
                  placeholder={t("search_client_name_ph")}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    setClientId(null);
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  onBlur={() => setTimeout(() => setShowClientDropdown(false), 150)}
                />
                {showClientDropdown && filteredCustomers.length > 0 && (
                  <div className="client-dropdown">
                    {filteredCustomers.map((c) => {
                      const isDuplicateName =
                        customers.filter((x) => x.name.trim().toLowerCase() === c.name.trim().toLowerCase()).length > 1;
                      return (
                        <div
                          key={c.id}
                          className="client-dropdown-item"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setClientName(c.name);
                            setClientId(c.id);
                            setShowClientDropdown(false);
                          }}
                        >
                          <div>{c.name}</div>
                          {(c.phone || isDuplicateName) && (
                            <div style={{ fontSize: 10.5, color: "#8B7355", marginTop: 1 }}>
                              {c.phone || ""}
                              {isDuplicateName ? (c.phone ? " · " : "") + t("duplicate_name_hint") : ""}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {clientName.trim() ? (
                  <div style={{ fontSize: 10.5, marginTop: 3, color: clientId ? "#7FAE7A" : "#B08A4E" }}>
                    {clientId
                      ? t("linked_client") + (linkedCustomerPhone ? ` (${linkedCustomerPhone})` : "")
                      : t("not_linked_client")}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <h2 className="section-title">{t("sales_section")}</h2>

          <table>
            <thead>
              <tr>
                <th className="col-item" style={{ width: "27%" }}>{t("category_col")}</th>
                <th style={{ width: "19%" }}>{t("price_col")}</th>
                <th style={{ width: "22%" }}>{t("labor_col")}</th>
                <th style={{ width: "22%" }}>{t("gram_col")}</th>
                <th style={{ width: "10%" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td className="col-item">
                    <select value={row.category} onChange={(e) => updateItem(row.id, "category", e.target.value)}>
                      <option value="">{t("select_category_ph")}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input type="text" inputMode="decimal" value={row.price} onChange={(e) => updateItem(row.id, "price", e.target.value)} />
                  </td>
                  <td>
                    <input type="text" inputMode="decimal" value={row.labor} onChange={(e) => updateItem(row.id, "labor", e.target.value)} />
                  </td>
                  <td>
                    <input type="text" inputMode="decimal" value={row.gram} onChange={(e) => updateItem(row.id, "gram", e.target.value)} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="row-del"
                      onClick={() => removeItemRow(row.id)}
                      title={t("delete_row_title")}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="total-label">{t("total_label")}</td>
                <td><input value={totalLabor.toFixed(2)} readOnly /></td>
                <td><input value={totalGold.toFixed(2)} readOnly /></td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={2} className="total-label">{t("discount_label")}</td>
                <td>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={discount}
                    onChange={(e) => setDiscount(toEnglishDigits(e.target.value))}
                    placeholder="0"
                  />
                </td>
                <td></td>
                <td></td>
              </tr>
              <tr className="final-total-row">
                <td colSpan={2} className="total-label">{t("total_label")}</td>
                <td><input value={netLabor.toFixed(2)} readOnly /></td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div className="controls">
            <div>
              <button className="rbtn" onClick={addItemRow}>{t("add_row")}</button>
              <button className="rbtn ghost" onClick={clearItems} style={{ marginLeft: 8 }}>{t("clear")}</button>
            </div>
          </div>

          <div className="section-divider"></div>

          <h2 className="section-title">{t("payments_section")}</h2>

          <table>
            <thead>
              <tr>
                <th className="col-item" style={{ width: "20%" }}>{t("method_col")}</th>
                <th style={{ width: "17%" }}>{t("labor_col")}</th>
                <th style={{ width: "26%" }}>{t("gold21k_col")}</th>
                <th style={{ width: "27%" }}>{t("notes_col")}</th>
                <th style={{ width: "10%" }}></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((row) => (
                <tr key={row.id}>
                  <td className="col-item">
                    <select value={row.method} onChange={(e) => updatePayment(row.id, "method", e.target.value)}>
                      <option value="">{t("select_method_ph")}</option>
                      <option value="Bars">{t("method_bars")}</option>
                      <option value="Scrap">{t("method_scrap")}</option>
                      <option value="Money">{t("method_money")}</option>
                      <option value="Transfer">{t("method_transfer")}</option>
                    </select>
                  </td>
                  <td>
                    <input type="text" inputMode="decimal" value={row.labor} onChange={(e) => updatePayment(row.id, "labor", e.target.value)} />
                  </td>
                  <td style={row.method === "Bars" || row.method === "Money" ? { height: "auto", padding: "4px 2px" } : undefined}>
                    {row.method === "Bars" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder={t("wt_g_ph")}
                            value={row.barWeight}
                            onChange={(e) => updatePayment(row.id, "barWeight", e.target.value)}
                            style={{ fontSize: 11, textAlign: "center" }}
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder={t("karat_ph")}
                            value={row.barKarat}
                            onChange={(e) => updatePayment(row.id, "barKarat", e.target.value)}
                            style={{ fontSize: 11, textAlign: "center" }}
                          />
                        </div>
                        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--gold-deep)" }}>
                          {row.gold21k ? `${row.gold21k} g` : "—"}
                        </div>
                      </div>
                    ) : row.method === "Money" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder={t("money_ph")}
                            value={row.moneyAmount}
                            onChange={(e) => updatePayment(row.id, "moneyAmount", e.target.value)}
                            style={{ fontSize: 11, textAlign: "center" }}
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder={t("gold_price_ph")}
                            value={row.goldPrice}
                            onChange={(e) => updatePayment(row.id, "goldPrice", e.target.value)}
                            style={{ fontSize: 11, textAlign: "center" }}
                          />
                        </div>
                        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--gold-deep)" }}>
                          {row.gold21k ? `${row.gold21k} g` : "—"}
                        </div>
                      </div>
                    ) : (
                      <input type="text" inputMode="decimal" value={row.gold21k} onChange={(e) => updatePayment(row.id, "gold21k", e.target.value)} />
                    )}
                  </td>
                  <td>
                    <input type="text" value={row.note} onChange={(e) => updatePayment(row.id, "note", e.target.value)} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="row-del"
                      onClick={() => removePaymentRow(row.id)}
                      title={t("delete_row_title")}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="total-label">{t("total_paid")}</td>
                <td><input value={totalPaymentLabor.toFixed(2)} readOnly /></td>
                <td><input value={totalPaymentGold21k.toFixed(2)} readOnly /></td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div className="controls">
            <div>
              <button className="rbtn" onClick={addPaymentRow}>{t("add_row")}</button>
              <button className="rbtn ghost" onClick={clearPayments} style={{ marginLeft: 8 }}>{t("clear")}</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {saveMessage ? (
                <span style={{ fontSize: 11, color: saveTone === "ok" ? "#7FAE7A" : saveTone === "warn" ? "#C9A227" : "#D4756B" }}>
                  {saveMessage}
                </span>
              ) : null}
              <button className="rbtn" onClick={saveStatement} disabled={saving || deleting}>
                {saving ? t("saving") : loadedId ? t("update") : t("save")}
              </button>
              {loadedId ? (
                <button
                  className="rbtn ghost"
                  onClick={deleteStatement}
                  disabled={saving || deleting}
                  style={{ borderColor: "#a3272c", color: "#a3272c" }}
                >
                  {deleting ? t("deleting") : t("delete")}
                </button>
              ) : null}
              <button className="rbtn ghost" onClick={() => window.print()}>{t("print")}</button>
            </div>
          </div>

          <div className="foot-note">{t("foot_note")}</div>
        </div>
      </div>
    </div>
  );
}

function ReviewsTab() {
  const { t } = useLang();
  const [view, setView] = useState(null); // null | "assets-liabilities" | "sales" | "transactions"

  if (view === "assets-liabilities") {
    return (
      <div>
        <button onClick={() => setView(null)} style={backBtn}>
          &larr; {t("reviews")}
        </button>
        <AssetsLiabilitiesScreen />
      </div>
    );
  }

  if (view === "sales") {
    return (
      <div>
        <button onClick={() => setView(null)} style={backBtn}>
          &larr; {t("reviews")}
        </button>
        <SalesScreen />
      </div>
    );
  }

  if (view === "transactions") {
    return (
      <div>
        <button onClick={() => setView(null)} style={backBtn}>
          &larr; {t("reviews")}
        </button>
        <TransactionsScreen />
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
        {t("reviews")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => setView("assets-liabilities")} style={bigHomeBtn}>
          {t("assets_liabilities")}
        </button>
        <button onClick={() => setView("sales")} style={bigHomeBtn}>
          {t("sales")}
        </button>
        <button onClick={() => setView("transactions")} style={bigHomeBtn}>
          {t("transactions")}
        </button>
      </div>
    </div>
  );
}

function AssetsLiabilitiesScreen() {
  const { t } = useLang();
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
    return <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>{t("loading")}</div>;
  }

  return (
    <div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#F3EEE3", marginBottom: 16 }}>
        {t("assets_liabilities")}
      </div>
      <div style={{ fontSize: 12, letterSpacing: 0.3, color: "#8B7355", marginBottom: 8 }}>{t("gold_section")}</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <SummaryCard label={t("owed_to_you_card")} value={grams(totals.goldAssets)} color="#D4756B" />
        <SummaryCard label={t("you_owe_card")} value={grams(totals.goldLiabilities)} color="#7FAE7A" />
      </div>
      <div style={{ fontSize: 12, letterSpacing: 0.3, color: "#8B7355", marginBottom: 8 }}>{t("wages_section")}</div>
      <div style={{ display: "flex", gap: 10 }}>
        <SummaryCard label={t("owed_to_you_card")} value={money(totals.wageAssets)} color="#D4756B" />
        <SummaryCard label={t("you_owe_card")} value={money(totals.wageLiabilities)} color="#7FAE7A" />
      </div>
      <div style={{ fontSize: 11, color: "#5A5340", marginTop: 20, textAlign: "center" }}>
        {t("clients_checked", { n: debugInfo.clientCount })}
        {debugInfo.error ? t("error_label", { e: debugInfo.error }) : ""}
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
  const { t } = useLang();
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
    return <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>{t("loading")}</div>;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#F3EEE3", marginBottom: 4 }}>
        {t("sales")}
      </div>
      <div style={{ fontSize: 12.5, color: "#8B7355", marginBottom: 18 }}>
        {t("sales_desc")}
      </div>

      {rows.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          {t("no_sales_yet")}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((row) => (
            <MonthSalesCard key={row.key} label={monthLabel(row.key)} gold={row.gold} wages={row.wages} t={t} />
          ))}
        </div>
      )}

      {error ? (
        <div style={{ fontSize: 11, color: "#5A5340", marginTop: 20, textAlign: "center" }}>error: {error}</div>
      ) : null}
    </div>
  );
}

function MonthSalesCard({ label, gold, wages, t }) {
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
        <SummaryCard label={t("gold_sold")} value={grams(gold)} color="#C9A227" />
        <SummaryCard label={t("wages_sold")} value={money(wages)} color="#C9A227" />
      </div>
    </div>
  );
}

// For a chosen date range, shows every client's gold/wage movements —
// pulled from their posted ledger entries — plus, grouped by the typed
// name, any statement that was saved without being linked to a client
// (those never post ledger entries, so their totals are recomputed
// straight from the saved items/payments instead).
function TransactionsScreen() {
  const { t } = useLang();
  const [fromDate, setFromDate] = useState(todayStr());
  const [toDate, setToDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let customers = [];
      try {
        const res = await window.storage.get("customers-list", false);
        customers = res ? JSON.parse(res.value) : [];
      } catch (e) {
        customers = [];
      }

      let ledgersById = {};
      try {
        ledgersById = await fetchAllLedgers(customers);
      } catch (e) {
        ledgersById = {};
      }

      const clientRows = customers.map((c) => {
        const ledger = ledgersById[c.id] || emptyLedger();
        const goldInRange = (ledger.gold || []).filter((e) => e.date && e.date >= fromDate && e.date <= toDate);
        const wageInRange = (ledger.wages || []).filter((e) => e.date && e.date >= fromDate && e.date <= toDate);
        return {
          key: "c:" + c.id,
          name: c.name,
          clientId: c.id,
          goldTaken: goldInRange.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0),
          goldPaid: goldInRange.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0),
          wageTaken: wageInRange.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0),
          wagePaid: wageInRange.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0),
        };
      });

      let unlinkedRows = [];
      try {
        const listRes = await window.storage.get("receipts-list", false);
        const list = listRes ? JSON.parse(listRes.value) : [];
        const inRange = list.filter((r) => r.date && r.date >= fromDate && r.date <= toDate);
        const fullReceipts = await Promise.all(
          inRange.map(async (r) => {
            try {
              const res = await window.storage.get("receipt:" + r.id, false);
              return res ? JSON.parse(res.value) : null;
            } catch (e) {
              return null;
            }
          })
        );
        const grouped = {};
        fullReceipts.forEach((data) => {
          if (!data || data.clientId) return; // linked ones already show via their ledger, above
          const name = (data.clientName || "").trim();
          if (!name) return;
          const totals = receiptTotals(data);
          const key = "u:" + name.toLowerCase();
          if (!grouped[key]) {
            grouped[key] = { key, name, clientId: null, goldTaken: 0, goldPaid: 0, wageTaken: 0, wagePaid: 0 };
          }
          grouped[key].goldTaken += totals.totalGold;
          grouped[key].goldPaid += totals.totalPaymentGold21k;
          grouped[key].wageTaken += totals.netLabor;
          grouped[key].wagePaid += totals.totalPaymentLabor;
        });
        unlinkedRows = Object.values(grouped);
      } catch (e) {
        unlinkedRows = [];
      }

      const all = [...clientRows, ...unlinkedRows]
        .filter((r) => r.goldTaken || r.goldPaid || r.wageTaken || r.wagePaid)
        .sort((a, b) => a.name.localeCompare(b.name));

      if (!cancelled) {
        setRows(all);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fromDate, toDate]);

  const periodTotals = rows.reduce(
    (acc, r) => ({
      goldTaken: acc.goldTaken + r.goldTaken,
      goldPaid: acc.goldPaid + r.goldPaid,
      wageTaken: acc.wageTaken + r.wageTaken,
      wagePaid: acc.wagePaid + r.wagePaid,
    }),
    { goldTaken: 0, goldPaid: 0, wageTaken: 0, wagePaid: 0 }
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#F3EEE3", marginBottom: 4 }}>
        {t("transactions")}
      </div>
      <div style={{ fontSize: 12.5, color: "#8B7355", marginBottom: 18 }}>{t("transactions_desc")}</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#8B7355", marginBottom: 4 }}>{t("from_label")}</div>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#8B7355", marginBottom: 4 }}>{t("to_label")}</div>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {!loading && rows.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#F3EEE3", marginBottom: 8 }}>
            {t("total_label")} · {t("tab_gold")}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <CustomStatCard label={t("taken")} value={grams(periodTotals.goldTaken)} color="#D4756B" />
            <CustomStatCard label={t("paid_back_stat")} value={grams(periodTotals.goldPaid)} color="#7FAE7A" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#F3EEE3", marginBottom: 8 }}>
            {t("total_label")} · {t("tab_wages")}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <CustomStatCard label={t("taken")} value={money(periodTotals.wageTaken)} color="#D4756B" />
            <CustomStatCard label={t("paid_back_stat")} value={money(periodTotals.wagePaid)} color="#7FAE7A" />
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>{t("loading")}</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "#8B7355", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>{t("no_transactions")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row) => (
            <TransactionRow key={row.key} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function TransactionRow({ row }) {
  const { t } = useLang();
  return (
    <div style={{ background: "#1C1913", border: "1px solid #3A3527", borderRadius: 10, padding: "0.75rem 0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600, color: "#F3EEE3" }}>{row.name}</div>
        {!row.clientId && (
          <div
            style={{
              fontSize: 9.5,
              color: "#8B7355",
              border: "1px solid #3A3527",
              borderRadius: 6,
              padding: "1px 6px",
              whiteSpace: "nowrap",
            }}
          >
            {t("unlinked_tag")}
          </div>
        )}
      </div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10.5, color: "#8B7355", marginBottom: 2 }}>{t("tab_gold")}</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#D4756B" }}>{t("taken")}: {grams(row.goldTaken)}</span>
          <span style={{ fontSize: 13, color: "#7FAE7A" }}>{t("paid_back_stat")}: {grams(row.goldPaid)}</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10.5, color: "#8B7355", marginBottom: 2 }}>{t("tab_wages")}</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#D4756B" }}>{t("taken")}: {money(row.wageTaken)}</span>
          <span style={{ fontSize: 13, color: "#7FAE7A" }}>{t("paid_back_stat")}: {money(row.wagePaid)}</span>
        </div>
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
  return (
    <LanguageProvider>
      <LedgerHome />
    </LanguageProvider>
  );
}

function LedgerHome() {
  const { t, dir, lang, setLangDirect } = useLang();
  const [homeTab, setHomeTab] = useState(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  if (!homeTab) {
    return (
      <div
        dir={dir}
        style={{
          fontFamily: "'Inter', sans-serif",
          maxWidth: 480,
          margin: "0 auto",
          padding: "2rem 1rem",
          position: "relative",
        }}
      >
        <button onClick={() => setShowLangMenu((v) => !v)} style={langToggleBtnStyle}>
          {lang === "en" ? "English" : "العربية"}
        </button>
        {showLangMenu && (
          <div style={langMenuStyle}>
            <button
              onClick={() => {
                setLangDirect("en");
                setShowLangMenu(false);
              }}
              style={{ ...langMenuItemStyle, fontWeight: lang === "en" ? 700 : 400 }}
            >
              English
            </button>
            <button
              onClick={() => {
                setLangDirect("ar");
                setShowLangMenu(false);
              }}
              style={{ ...langMenuItemStyle, fontWeight: lang === "ar" ? 700 : 400 }}
            >
              العربية
            </button>
          </div>
        )}
        <div style={{ fontSize: 12, letterSpacing: 0.3, color: "#8B7355", marginBottom: 2 }}>{t("home")}</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, margin: "0 0 1.5rem", color: "#F3EEE3" }}>
          {t("app_title")}
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setHomeTab("clients")} style={bigHomeBtn}>
            {t("nav_clients")}
          </button>
          <button onClick={() => setHomeTab("receipts")} style={bigHomeBtn}>
            {t("nav_receipts")}
          </button>
          <button onClick={() => setHomeTab("reviews")} style={bigHomeBtn}>
            {t("nav_reviews")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} style={{ fontFamily: "'Inter', sans-serif", maxWidth: 480, margin: "0 auto", padding: "1rem 1rem 0" }}>
      <button onClick={() => setHomeTab(null)} style={backBtn}>
        {t("home")}
      </button>
      {homeTab === "clients" && <ClientsTab />}
      {homeTab === "receipts" && <ReceiptsTab />}
      {homeTab === "reviews" && <ReviewsTab />}
    </div>
  );
}
