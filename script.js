// ===== NAVIGATION =====
const ACTIVE_NAV =
  "bg-[#E30613]/10 text-[#E30613] p-3 rounded-xl font-bold cursor-pointer";
const INACTIVE_NAV =
  "text-gray-400 hover:text-white p-3 rounded-xl transition cursor-pointer";

const ALL_PAGES = [
  "pageHome",
  "pageDiary",
  "pageSubjects",
  "pageCourses",
  "pageSettings",
  "pageContact",
];
const ALL_NAVS = [
  "navHome",
  "navDiary",
  "navSubjects",
  "navCourses",
  "navSettings",
  "navContact",
];

// ===== SIDEBAR MOBILE =====
let isSidebarOpen = false;

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  isSidebarOpen = !isSidebarOpen;

  if (isSidebarOpen) {
    sidebar.classList.remove("translate-x-full");
    sidebar.classList.add("translate-x-0");
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.remove("opacity-0"), 10);
  } else {
    sidebar.classList.add("translate-x-full");
    sidebar.classList.remove("translate-x-0");
    overlay.classList.add("opacity-0");
    setTimeout(() => overlay.classList.add("hidden"), 300);
  }
}

function showPage(page) {
  ALL_PAGES.forEach((id) =>
    document.getElementById(id).classList.add("hidden"),
  );
  ALL_NAVS.forEach(
    (id) => (document.getElementById(id).className = INACTIVE_NAV),
  );

  document
    .getElementById("page" + page.charAt(0).toUpperCase() + page.slice(1))
    .classList.remove("hidden");
  document.getElementById(
    "nav" + page.charAt(0).toUpperCase() + page.slice(1),
  ).className = ACTIVE_NAV;

  if (page === "home") renderHome();
  if (page === "diary") renderEntries();
  if (page === "subjects") renderSubjects();
  if (page === "courses") renderCourses();
  if (page === "settings") renderSettings();

  // Close sidebar on mobile if open
  if (window.innerWidth < 768 && isSidebarOpen) {
    toggleSidebar();
  }
}

// ===== DIARY =====
function saveEntry() {
  const type = document.getElementById("entryType").value;
  const subject = document.getElementById("entrySubject").value.trim();
  const done = document.getElementById("entryDone").value.trim();
  const remaining = document.getElementById("entryRemaining").value.trim();
  const notes = document.getElementById("entryNotes").value.trim();

  if (!subject || !done) {
    showToast("اكتب اسم المادة وإيه اللي عملته!", "error");
    return;
  }

  const entry = {
    id: Date.now(),
    type,
    subject,
    done,
    remaining,
    notes,
    date: new Date().toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  const entries = getEntries();
  entries.unshift(entry);
  localStorage.setItem("zsc_diary", JSON.stringify(entries));

  document.getElementById("entrySubject").value = "";
  document.getElementById("entryDone").value = "";
  document.getElementById("entryRemaining").value = "";
  document.getElementById("entryNotes").value = "";

  renderEntries();
  showToast("تم حفظ الإنجاز بنجاح يا بطل! ", "success");
}

function getEntries() {
  return JSON.parse(localStorage.getItem("zsc_diary") || "[]");
}

function deleteEntry(id) {
  localStorage.setItem(
    "zsc_diary",
    JSON.stringify(getEntries().filter((e) => e.id !== id)),
  );
  renderEntries();
  showToast("تم مسح الإنجاز.", "success");
}

function clearAllEntries() {
  if (confirm("أكيد عايز تمسح كل السجلات؟ (مش هتقدر ترجعهم تاني)")) {
    localStorage.removeItem("zsc_diary");
    renderEntries();
    showToast("تم مسح كل السجلات.", "success");
  }
}

function renderEntries() {
  const list = document.getElementById("entriesList");
  const clearBtn = document.getElementById("clearAllBtn");
  const entries = getEntries();
  
  if (!entries.length) {
    list.innerHTML = `<div class="text-center py-12 text-gray-600"><p class="text-sm">مفيش سجلات لحد دلوقتي..</p></div>`;
    if(clearBtn) clearBtn.classList.add("hidden");
    return;
  }
  
  if(clearBtn) clearBtn.classList.remove("hidden");
  list.innerHTML = entries
    .map(
      (e) => `
    <div class="bg-[#1a1a1a] p-5 rounded-2xl border-t-4 border-[#E30613]">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold px-3 py-1 rounded-full ${e.type === "course" ? "bg-[#E30613]/10 text-[#E30613]" : "bg-white/5 text-gray-300"}">
            ${e.type === "course" ? "كورس خارجي" : "مادة كلية"}
          </span>
          <span class="text-xs text-gray-600">${e.date}</span>
        </div>
        <button onclick="deleteEntry(${e.id})" class="text-gray-600 hover:text-[#E30613] transition text-sm">مسح</button>
      </div>
      <p class="text-sm text-gray-400 mb-1">المادة: <span class="text-white font-bold">${e.subject}</span></p>
      <p class="text-sm text-gray-300">✅ ${e.done}</p>
      ${e.remaining ? `<p class="text-xs text-gray-500 mt-2 pt-2 border-t border-white/5">لسه: ${e.remaining}</p>` : ""}
      ${e.notes ? `<p class="text-xs text-gray-500 mt-1">${e.notes}</p>` : ""}
    </div>`,
    )
    .join("");
}

// ===== SUBJECTS (dynamic from localStorage) =====
const SUB_KEY = "zsc_subjects";
const SUB_CFG_KEY = "zsc_subjects_config";

function getSubConfig() {
  const def = [
    { name: "داتا بيز", lectures: 12 },
    { name: "داتا كوم", lectures: 12 },
    { name: "جرافيك", lectures: 12 },
    { name: "الكترونكس", lectures: 12 },
    { name: "احتمالات 2", lectures: 12 },
  ];
  return JSON.parse(localStorage.getItem(SUB_CFG_KEY) || JSON.stringify(def));
}
function saveSubConfig(cfg) {
  localStorage.setItem(SUB_CFG_KEY, JSON.stringify(cfg));
}
function getSubData() {
  return JSON.parse(localStorage.getItem(SUB_KEY) || "{}");
}
function saveSubData(data) {
  localStorage.setItem(SUB_KEY, JSON.stringify(data));
}

function renderSubjects() {
  const cfg = getSubConfig();
  const data = getSubData();
  document.getElementById("subjectsList").innerHTML = cfg
    .map((sub, si) => {
      const { name, lectures: LCOUNT } = sub;
      const lectures = data[name] || Array(LCOUNT).fill(false);
      const done = lectures.filter(Boolean).length;
      const percent = Math.round((done / LCOUNT) * 100);
      const slug = "sub-" + si;

      const lectureItems = lectures
        .map(
          (checked, i) => `
      <div class="rounded-xl border border-white/5 overflow-hidden mb-2">
        <div class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition"
        onclick="toggleLecture('${name}', ${i}, ${si})">
          <span id="${slug}-lec-${i}" class="text-sm ${checked ? "text-white font-bold" : "text-gray-400"}">محاضرة ${i + 1}</span>
          <input type="checkbox" ${checked ? "checked" : ""}
            id="${slug}-chk-${i}"
            onclick="event.stopPropagation()"
            onchange="toggleLecture('${name}', ${i}, ${si})"
            class="w-4 h-4 accent-[#E30613] cursor-pointer">
        </div>
      </div>`,
        )
        .join("");

      return `
      <div class="bg-[#1a1a1a] rounded-2xl border-t-4 border-[#E30613] overflow-hidden">
        <div onclick="toggleAccordion('${slug}')" class="p-6 cursor-pointer flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span id="${slug}-arrow" class="arrow text-[#E30613] text-xs">▼</span>
            <div>
              <h3 class="text-xl font-bold">${name}</h3>
              <p id="${slug}-meta" class="text-xs text-gray-500 mt-1">${done} / ${LCOUNT} محاضرة — ${percent}%</p>
            </div>
          </div>
          <div class="w-32">
            <div class="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div id="${slug}-bar" class="bg-[#E30613] h-full transition-all duration-300" style="width:${percent}%"></div>
            </div>
          </div>
        </div>
        <div id="${slug}-panel" class="lectures-panel">
          <div class="px-6 pb-6">${lectureItems}</div>
        </div>
      </div>`;
    })
    .join("");
}

function toggleAccordion(slug) {
  const panel = document.getElementById(slug + "-panel");
  const arrow = document.getElementById(slug + "-arrow");
  const isOpen = panel.classList.contains("open");
  panel.classList.toggle("open", !isOpen);
  arrow.classList.toggle("open", !isOpen);
}

function toggleLecture(name, index, si) {
  const cfg = getSubConfig();
  const LCOUNT = cfg[si].lectures;
  const data = getSubData();
  const lectures = data[name] || Array(LCOUNT).fill(false);
  const slug = "sub-" + si;
  const chk = document.getElementById(`${slug}-chk-${index}`);

  if (document.activeElement !== chk) {
    lectures[index] = !lectures[index];
    chk.checked = lectures[index];
  } else {
    lectures[index] = chk.checked;
  }

  data[name] = lectures;
  saveSubData(data);

  const done = lectures.filter(Boolean).length;
  const percent = Math.round((done / LCOUNT) * 100);

  document.getElementById(`${slug}-bar`).style.width = percent + "%";
  document.getElementById(`${slug}-meta`).textContent =
    `${done} / ${LCOUNT} محاضرة — ${percent}%`;
  document.getElementById(`${slug}-lec-${index}`).className =
    `text-sm ${lectures[index] ? "text-white font-bold" : "text-gray-400"}`;
}

// ===== COURSES (dynamic from localStorage) =====
const CRS_KEY = "zsc_courses";
const CRS_CFG_KEY = "zsc_courses_config";

function getCrsConfig() {
  const def = [
    { name: "JavaScript" },
    { name: "React" },
    { name: "Next.js" },
    { name: "Tailwind" },
    { name: "TypeScript" },
    { name: "Git & GitHub" },
    { name: "Testing" },
  ];
  return JSON.parse(localStorage.getItem(CRS_CFG_KEY) || JSON.stringify(def));
}
function saveCrsConfig(cfg) {
  localStorage.setItem(CRS_CFG_KEY, JSON.stringify(cfg));
}
function getCrsData() {
  return JSON.parse(localStorage.getItem(CRS_KEY) || "{}");
}
function saveCrsData(data) {
  localStorage.setItem(CRS_KEY, JSON.stringify(data));
}

function renderCourses() {
  const cfg = getCrsConfig();
  const data = getCrsData();
  document.getElementById("coursesList").innerHTML = cfg
    .map((c, ci) => {
      const percent = data[c.name] || 0;
      return `
      <div class="bg-[#1a1a1a] p-6 rounded-2xl border-t-4 border-[#E30613] hover:scale-[1.02] transition-transform duration-300 mt-1">
        <h3 class="text-xl font-bold mb-4">${c.name}</h3>
        <div class="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-2">
          <div id="crs-bar-${ci}" class="bg-[#E30613] h-full transition-all duration-1000 ease-out" style="width:${percent}%"></div>
        </div>
        <p id="crs-pct-${ci}" class="text-xs text-gray-500 mb-4">${percent}% مكتمل</p>
        <div class="flex items-center gap-2">
          <input type="number" id="crs-val-${ci}" placeholder="مثال: 15" min="1" max="100"
              class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-center text-sm focus:outline-none focus:border-[#E30613] transition"
              onkeypress="if(event.key === 'Enter') addCoursePercent(${ci}, '${c.name}')">
          <button onclick="addCoursePercent(${ci}, '${c.name}')"
              class="bg-[#E30613]/10 hover:bg-[#E30613]/20 text-[#E30613] text-sm px-4 py-2 rounded-lg transition font-bold shrink-0">إضافة %</button>
        </div>
        <button onclick="resetCourse(${ci}, '${c.name}')"
              class="w-full mt-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs px-3 py-2 rounded-lg transition">تصفير الإنجاز</button>
      </div>`;
    })
    .join("");
}

function addCoursePercent(ci, name) {
  const inputEl = document.getElementById(`crs-val-${ci}`);
  let addedValue = parseInt(inputEl.value);
  
  if (isNaN(addedValue) || addedValue <= 0) {
    showToast("اكتب نسبة صحيحة الأول!", "error");
    return;
  }
  
  const data = getCrsData();
  const currentVal = data[name] || 0;
  const updated = Math.min(100, currentVal + addedValue);
  
  data[name] = updated;
  saveCrsData(data);
  
  document.getElementById(`crs-bar-${ci}`).style.width = updated + "%";
  
  // Smoothly count up the text
  const pctEl = document.getElementById(`crs-pct-${ci}`);
  let startVal = currentVal;
  const dur = 1000;
  const steps = 30; // 30 updates
  const stepTime = dur / steps;
  const valStep = (updated - currentVal) / steps;
  
  let i = 0;
  let counter = setInterval(() => {
    i++;
    startVal += valStep;
    if (i >= steps) {
        startVal = updated;
        clearInterval(counter);
    }
    pctEl.textContent = Math.round(startVal) + "% مكتمل";
  }, stepTime);
  
  inputEl.value = "";
  
  showToast(`عاش! تم إضافة ${addedValue}% لتقدم الكورس.`, "success");
}

function resetCourse(ci, name) {
  const data = getCrsData();
  data[name] = 0;
  saveCrsData(data);
  document.getElementById(`crs-bar-${ci}`).style.width = "0%";
  document.getElementById(`crs-pct-${ci}`).textContent = "0% مكتمل";
}

// ===== HOME STATS =====
function renderHome() {
  const subCfg = getSubConfig();
  const subData = getSubData();
  const crsData = getCrsData();
  const crsCfg = getCrsConfig();

  // lectures stats
  let totalLec = 0,
    doneLec = 0;
  subCfg.forEach((sub) => {
    const lectures = subData[sub.name] || Array(sub.lectures).fill(false);
    totalLec += sub.lectures;
    doneLec += lectures.filter(Boolean).length;
  });
  document.getElementById("statLecDone").textContent = doneLec;
  document.getElementById("statLecTotal").textContent =
    "من " + totalLec + " محاضرة";

  // subjects avg
  let subTotal = 0;
  subCfg.forEach((sub) => {
    const lectures = subData[sub.name] || Array(sub.lectures).fill(false);
    subTotal += Math.round(
      (lectures.filter(Boolean).length / sub.lectures) * 100,
    );
  });
  document.getElementById("statSubAvg").textContent = subCfg.length
    ? Math.round(subTotal / subCfg.length) + "%"
    : "0%";

  // courses avg
  let crsTotal = 0;
  crsCfg.forEach((c) => {
    crsTotal += crsData[c.name] || 0;
  });
  document.getElementById("statCrsAvg").textContent = crsCfg.length
    ? Math.round(crsTotal / crsCfg.length) + "%"
    : "0%";

  // subjects mini cards
  document.getElementById("homeSubjects").innerHTML = subCfg
    .map((sub) => {
      const lectures = subData[sub.name] || Array(sub.lectures).fill(false);
      const done = lectures.filter(Boolean).length;
      const percent = Math.round((done / sub.lectures) * 100);
      return `
      <div class="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 hover:border-white/10 transition group flex flex-col justify-between">
        <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-white group-hover:text-[#E30613] transition">${sub.name}</h3>
            <span class="text-xs font-bold px-2 py-1 rounded bg-[#E30613]/10 text-[#E30613]">${percent}%</span>
        </div>
        <div>
            <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mb-2">
            <div class="bg-[#E30613] h-full" style="width:${percent}%"></div>
            </div>
            <p class="text-xs text-gray-500 text-left">${done} من ${sub.lectures} محاضرة</p>
        </div>
      </div>`;
    })
    .join("");

  // courses mini cards
  document.getElementById("homeCourses").innerHTML = crsCfg
    .map((c) => {
      const percent = crsData[c.name] || 0;
      return `
      <div class="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 hover:border-white/10 transition group flex flex-col justify-between">
        <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-white group-hover:text-[#E30613] transition">${c.name}</h3>
            <span class="text-xs font-bold px-2 py-1 rounded bg-[#E30613]/10 text-[#E30613]">${percent}%</span>
        </div>
        <div>
            <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mb-2">
            <div class="bg-[#E30613] h-full" style="width:${percent}%"></div>
            </div>
            <p class="text-xs text-gray-500 text-left">التقدم الكلي</p>
        </div>
      </div>`;
    })
    .join("");
}

// ===== SETTINGS =====
function renderSettings() {
  const subCfg = getSubConfig();
  const crsCfg = getCrsConfig();

  document.getElementById("settingsSubjectsList").innerHTML = subCfg
    .map(
      (sub, i) => `
    <div class="flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl mb-3">
      <span class="text-sm">${sub.name}</span>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-500">${sub.lectures} محاضرة</span>
        <button onclick="removeSubject(${i})" class="text-gray-600 hover:text-[#E30613] transition text-xs">مسح</button>
      </div>
    </div>`,
    )
    .join("");

  document.getElementById("settingsCoursesList").innerHTML = crsCfg
    .map(
      (c, i) => `
    <div class="flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl mb-3">
      <span class="text-sm">${c.name}</span>
      <button onclick="removeCourse(${i})" class="text-gray-600 hover:text-[#E30613] transition text-xs">مسح</button>
    </div>`,
    )
    .join("");
}

function addSubject() {
  const name = document.getElementById("newSubjectName").value.trim();
  const lectures =
    parseInt(document.getElementById("newSubjectLectures").value) || 12;
  if (!name) {
    showToast("اكتب اسم المادة عشان نضيفها!", "error");
    return;
  }

  const cfg = getSubConfig();
  if (cfg.find((s) => s.name === name)) {
    showToast("المادة دي متسجلة بالفعل!", "error");
    return;
  }
  cfg.push({ name, lectures });
  saveSubConfig(cfg);

  document.getElementById("newSubjectName").value = "";
  document.getElementById("newSubjectLectures").value = "12";
  renderSettings();
  showToast("تم إضافة المادة بنجاح.", "success");
}

function removeSubject(index) {
  if (!confirm("هتمسح المادة دي وكل بياناتها، متأكد؟")) return;
  const cfg = getSubConfig();
  const name = cfg[index].name;
  cfg.splice(index, 1);
  saveSubConfig(cfg);

  // مسح البيانات المرتبطة
  const data = getSubData();
  delete data[name];
  delete data[name + "_notes"];
  saveSubData(data);
  renderSettings();
}

function addCourse() {
  const name = document.getElementById("newCourseName").value.trim();
  if (!name) {
    showToast("اكتب اسم الكورس عشان نضيفه!", "error");
    return;
  }

  const cfg = getCrsConfig();
  if (cfg.find((c) => c.name === name)) {
    showToast("الكورس ده متسجل بالفعل!", "error");
    return;
  }
  cfg.push({ name });
  saveCrsConfig(cfg);

  document.getElementById("newCourseName").value = "";
  renderSettings();
  showToast("تم إضافة الكورس بنجاح.", "success");
}

function removeCourse(index) {
  if (!confirm("هتمسح الكورس ده وبياناته، متأكد؟")) return;
  const cfg = getCrsConfig();
  const name = cfg[index].name;
  cfg.splice(index, 1);
  saveCrsConfig(cfg);

  const data = getCrsData();
  delete data[name];
  saveCrsData(data);
  renderSettings();
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  
  // Design depends on the type
  const isError = type === "error";
  const bgColor = isError ? "bg-[#1a1a1a]" : "bg-[#E30613]";
  const textColor = isError ? "text-[#E30613]" : "text-white";
  const border = isError ? "border-l-4 border-[#E30613]" : "";

  toast.className = `flex items-center justify-between px-6 py-3 rounded-lg shadow-lg text-sm font-bold ${bgColor} ${textColor} ${border} transform translate-y-10 opacity-0 transition-all duration-300`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
  }, 10);

  // Autohide & Remove
  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-10", "opacity-0");
    setTimeout(() => {
      if (toast.parentNode === container) container.removeChild(toast);
    }, 300);
  }, 3000);
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  showPage("home");
});
