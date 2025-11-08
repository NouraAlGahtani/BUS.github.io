// Basic state + render system for the MVP
const state = {
  tutors: [],
  filtered: [],
  filters: { q: '', subject: '', city: '', rateMin: '', rateMax: '', sortBy: 'relevance' }
};

function $(id) { return document.getElementById(id) }
function create(el, cls=''){ const e = document.createElement(el); if(cls) e.className = cls; return e; }

async function loadData() {
  const res = await fetch('./data/tutors.json');
  const data = await res.json();
  state.tutors = data;
  bootstrapFilters(data);
  applyFilters();
}

function bootstrapFilters(data) {
  const subjects = Array.from(new Set(data.flatMap(t => t.subjects))).sort();
  const cities = Array.from(new Set(data.map(t => t.city))).sort();
  subjects.forEach(s => { const opt = create('option'); opt.value = s; opt.textContent = s; $('subject').appendChild(opt); });
  cities.forEach(c => { const opt = create('option'); opt.value = c; opt.textContent = c; $('city').appendChild(opt); });
}

function applyFilters() {
  const f = state.filters;
  state.filtered = state.tutors.filter(t => {
    const qmatch = f.q ? (t.name.toLowerCase().includes(f.q) || t.bio.toLowerCase().includes(f.q) || t.subjects.join(' ').toLowerCase().includes(f.q)) : true;
    const smatch = f.subject ? t.subjects.includes(f.subject) : true;
    const cmatch = f.city ? t.city === f.city : true;
    const rmin = f.rateMin ? Number(t.rate) >= Number(f.rateMin) : true;
    const rmax = f.rateMax ? Number(t.rate) <= Number(f.rateMax) : true;
    return qmatch && smatch && cmatch && rmin && rmax;
  });

  switch (f.sortBy) {
    case 'rating': state.filtered.sort((a,b) => b.rating - a.rating); break;
    case 'rateAsc': state.filtered.sort((a,b) => a.rate - b.rate); break;
    case 'rateDesc': state.filtered.sort((a,b) => b.rate - a.rate); break;
    default: /* relevance: keep order as-is */ break;
  }

  renderCards();
}

function renderCards() {
  const grid = $('cards');
  grid.innerHTML = '';
  $('resultsCount').textContent = `Showing ${state.filtered.length} tutor${state.filtered.length!==1?'s':''}`;

  state.filtered.forEach(t => {
    const card = create('div', 'bg-white rounded-2xl border shadow-soft overflow-hidden flex flex-col');
    const top = create('div', 'p-5 flex items-start gap-4');
    const avatar = create('div', 'shrink-0');
    avatar.innerHTML = `<img src="${t.avatar}" alt="${t.name}" class="h-16 w-16 rounded-xl object-cover">`;
    const info = create('div','flex-1');
    info.innerHTML = `
      <div class="flex items-center gap-2">
        <h5 class="font-semibold text-lg">${t.name}</h5>
        ${t.verified ? `<span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' class='w-4 h-4'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1L12 2z'/></svg> Verified</span>` : ''}
      </div>
      <p class="text-sm text-gray-600 mt-0.5">${t.subjects.join(' • ')}</p>
      <p class="text-xs text-gray-500 mt-1">${t.bio}</p>
      <div class="mt-2 flex items-center gap-3 text-sm text-gray-700">
        <span class="inline-flex items-center gap-1">
          <svg xmlns='http://www.w3.org/2000/svg' class='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z'/></svg>
          ${t.city}
        </span>
        <span>•</span>
        <span class="inline-flex items-center gap-1">
          <svg xmlns='http://www.w3.org/2000/svg' class='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.56C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/></svg>
          ${t.modality.join(' / ')}
        </span>
      </div>
    `;
    const side = create('div','text-right');
    side.innerHTML = `
      <div class="text-xl font-bold">SAR ${t.rate}<span class="text-xs text-gray-500 font-normal">/hr</span></div>
      <div class="mt-1 text-yellow-500" title="${t.rating.toFixed(1)} rating">
        ${'★'.repeat(Math.round(t.rating))}<span class="text-gray-300">${'★'.repeat(5-Math.round(t.rating))}</span>
      </div>
    `;
    top.appendChild(avatar); top.appendChild(info); top.appendChild(side);
    card.appendChild(top);

    const actions = create('div','px-5 pb-4 flex items-center gap-3 mt-auto');
    const btn1 = create('button','px-4 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700');
    btn1.textContent = 'Book Trial';
    btn1.onclick = () => openBooking(t);
    const btn2 = create('button','px-4 py-2.5 rounded-xl border hover:bg-gray-50');
    btn2.textContent = 'View Profile';
    btn2.onclick = () => openProfile(t);
    actions.appendChild(btn1); actions.appendChild(btn2);
    card.appendChild(actions);

    grid.appendChild(card);
  });
}

function openProfile(t) {
  const m = modal(`
    <div class="p-5">
      <div class="flex items-start gap-4">
        <img src="${t.avatar}" class="h-20 w-20 rounded-xl object-cover" />
        <div class="flex-1">
          <h3 class="text-xl font-semibold">${t.name} ${t.verified?'<span class="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Verified</span>':''}</h3>
          <p class="text-sm text-gray-600 mt-1">${t.bio}</p>
          <p class="mt-2 text-sm text-gray-700"><strong>Subjects:</strong> ${t.subjects.join(', ')}</p>
          <p class="text-sm text-gray-700"><strong>Experience:</strong> ${t.experience}</p>
          <p class="text-sm text-gray-700"><strong>Languages:</strong> ${t.languages.join(', ')}</p>
        </div>
        <div class="text-right">
          <div class="text-xl font-bold">SAR ${t.rate}<span class="text-xs text-gray-500 font-normal">/hr</span></div>
          <div class="mt-1 text-yellow-500">${'★'.repeat(Math.round(t.rating))}<span class="text-gray-300">${'★'.repeat(5-Math.round(t.rating))}</span></div>
        </div>
      </div>
      <div class="mt-4 flex items-center gap-3">
        <button class="px-4 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700" id="bookNow">Book Trial</button>
        <button class="px-4 py-2.5 rounded-xl border hover:bg-gray-50" id="closeProfile">Close</button>
      </div>
    </div>
  `);
  m.querySelector('#bookNow').onclick = () => { m.remove(); openBooking(t); };
  m.querySelector('#closeProfile').onclick = () => m.remove();
}

function openBooking(t) {
  const feePct = 0.12; // 12% commission
  const trialMinutes = 20;
  const base = Math.max(10, Math.round((t.rate/60)*trialMinutes)); // pro-rate hourly to trial minutes, min 10 SAR
  const fee = Math.round(base * feePct);
  const total = base + fee;

  const m = modal(`
    <div class="p-5">
      <h3 class="text-xl font-semibold">Book trial with ${t.name}</h3>
      <p class="text-sm text-gray-600 mt-1">Trial: ${trialMinutes} minutes • Pro‑rated from hourly rate.</p>
      <div class="mt-4 grid sm:grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-gray-500">Date</label>
          <input type="date" id="bkDate" class="mt-1 w-full px-3 py-2 rounded-xl border" />
        </div>
        <div>
          <label class="text-xs text-gray-500">Time</label>
          <input type="time" id="bkTime" class="mt-1 w-full px-3 py-2 rounded-xl border" />
        </div>
        <div class="sm:col-span-2">
          <label class="text-xs text-gray-500">Preferred modality</label>
          <select id="bkModality" class="mt-1 w-full px-3 py-2 rounded-xl border">
            ${t.modality.map(m => `<option>${m}</option>`).join('')}
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="text-xs text-gray-500">Notes</label>
          <textarea id="bkNotes" rows="3" class="mt-1 w-full px-3 py-2 rounded-xl border" placeholder="What would you like to focus on?"></textarea>
        </div>
      </div>
      <div class="mt-4 p-3 rounded-xl bg-gray-50 border text-sm">
        <div class="flex justify-between"><span>Base (trial)</span><span>SAR ${base}</span></div>
        <div class="flex justify-between"><span>Platform fee (12%)</span><span>SAR ${fee}</span></div>
        <div class="flex justify-between font-semibold"><span>Total</span><span>SAR ${total}</span></div>
      </div>
      <div class="mt-4 flex items-center gap-3">
        <button class="px-4 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700" id="confirmBk">Confirm</button>
        <button class="px-4 py-2.5 rounded-xl border hover:bg-gray-50" id="cancelBk">Cancel</button>
      </div>
    </div>
  `);

  m.querySelector('#confirmBk').onclick = () => {
    const date = m.querySelector('#bkDate').value;
    const time = m.querySelector('#bkTime').value;
    if(!date || !time) { alert('Please choose date & time'); return; }
    const modality = m.querySelector('#bkModality').value;
    const notes = m.querySelector('#bkNotes').value;
    const record = { tutorId: t.id, tutor: t.name, date, time, modality, notes, total, createdAt: new Date().toISOString() };
    const key = 'ustaadh_bookings';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    prev.push(record);
    localStorage.setItem(key, JSON.stringify(prev));
    m.remove();
    toast(`Booked trial with ${t.name} on ${date} at ${time}. Check email for confirmation.`);
  };
  m.querySelector('#cancelBk').onclick = () => m.remove();
}

function modal(innerHTML) {
  const root = document.getElementById('modalRoot');
  const overlay = create('div', 'fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50');
  const panel = create('div', 'bg-white rounded-2xl w-full max-w-2xl shadow-soft');
  panel.innerHTML = innerHTML;
  overlay.appendChild(panel);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) overlay.remove(); });
  root.appendChild(overlay);
  return panel;
}

function toast(msg) {
  const t = create('div', 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-soft z-50');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 2600);
}

function attachEvents() {
  $('applyFilters').onclick = () => {
    state.filters.q = ($('q').value || '').trim().toLowerCase();
    state.filters.subject = $('subject').value;
    state.filters.city = $('city').value;
    state.filters.rateMin = $('rateMin').value;
    state.filters.rateMax = $('rateMax').value;
    state.filters.sortBy = $('sortBy').value;
    applyFilters();
  };
  $('clearFilters').onclick = () => {
    ['q','subject','city','rateMin','rateMax','sortBy'].forEach(id => {
      if(id==='sortBy') $('sortBy').value='relevance'; else $(id).value='';
    });
    state.filters = { q:'', subject:'', city:'', rateMin:'', rateMax:'', sortBy:'relevance' };
    applyFilters();
  };
  $('sortBy').onchange = () => { state.filters.sortBy = $('sortBy').value; applyFilters(); };
}

document.addEventListener('DOMContentLoaded', () => {
  attachEvents();
  loadData();
});
