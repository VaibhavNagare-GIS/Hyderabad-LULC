const APP_URL = 'https://vaibhav-gee.projects.earthengine.app/view/hyderabad-lulc';
const REPOSITORY_URL = '';
const CSV_URL = './Data/Hyderabad_LULC_Class_Area_Statistics.csv';
const REQUIRED_HEADERS = ['class_id', 'class_name', 'area_km2', 'area_percent'];
const CLASS_COLORS = { 'Built-up': '#ff0000', Waterbody: '#28C4FA', Forest: '#0c922c', 'Barren Land': '#ffd217', 'Floating Veg': '#0000ff' };
let areaData = [];
let areaChart;

function setStatus(message = '') { document.querySelector('#data-status').textContent = message; }
function number(value, digits = 2) { return new Intl.NumberFormat('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value); }
function validUrl(value) { try { return new URL(value).protocol === 'https:'; } catch { return false; } }

function configureRepositoryLink() {
  if (!validUrl(REPOSITORY_URL)) return;
  const link = document.querySelector('#repository-link');
  link.href = REPOSITORY_URL;
  document.querySelector('#repository-slot').hidden = false;
  document.querySelector('.repo-placeholder').hidden = true;
}

function activateTab(nextTab) {
  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    const active = tab === nextTab;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.querySelector(`#${tab.getAttribute('aria-controls')}`).hidden = !active;
  });
  if (nextTab.id === 'tab-chart') renderAreaChart();
}

function setupTabs() {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (event) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -index, End: tabs.length - index - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      const next = tabs[(index + keys[event.key] + tabs.length) % tabs.length];
      next.focus();
      activateTab(next);
    });
  });
}

function renderTable(rows) {
  const body = document.querySelector('#area-table tbody');
  body.replaceChildren();
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = CLASS_COLORS[row.class_name] || '#ffffff';
    const name = document.createElement('td'); name.append(swatch, document.createTextNode(row.class_name));
    const area = document.createElement('td'); area.textContent = `${number(row.area_km2)} km²`;
    const percent = document.createElement('td'); percent.textContent = `${number(row.area_percent)}%`;
    tr.append(name, area, percent); body.append(tr);
  });
}

function renderInterpretation(rows) {
  const ranked = [...rows].sort((a, b) => b.area_km2 - a.area_km2);
  const total = rows.reduce((sum, row) => sum + row.area_km2, 0);
  const [first, second, ...remaining] = ranked;
  const remainingText = remaining.map((row) => `${row.class_name} (${number(row.area_km2)} km², ${number(row.area_percent)}%)`).join(', ');
  document.querySelector('#interpretation-text').textContent = `The exported 2025 classification records ${rows.length} mapped land-cover classes across ${number(total)} square kilometres in Hyderabad District. Built-up land is the largest mapped class at ${number(first.area_km2)} square kilometres, representing ${number(first.area_percent)}% of the classified area. Forest is the second-largest class at ${number(second.area_km2)} square kilometres, or ${number(second.area_percent)}%. The remaining mapped classes are ${remainingText}. These figures describe the distribution in the supplied class-area export. They do not by themselves establish the reasons for the observed distribution, changes in land cover, or the condition of individual locations within the district.`;
}

function renderAreaChart() {
  if (!areaData.length || areaChart) return;
  areaChart = new Chart(document.querySelector('#area-chart'), {
    type: 'bar',
    data: { labels: areaData.map((row) => row.class_name), datasets: [{ label: 'Area (km²)', data: areaData.map((row) => row.area_km2), backgroundColor: areaData.map((row) => CLASS_COLORS[row.class_name]), borderColor: '#171717', borderWidth: 2 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 180 }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${number(context.raw)} km² · ${number(areaData[context.dataIndex].area_percent)}%` } } }, scales: { x: { title: { display: true, text: 'Area (km²)', font: { family: 'IBM Plex Mono', weight: '600' } }, ticks: { font: { family: 'IBM Plex Mono' } }, grid: { color: '#c9c1b1' } }, y: { ticks: { font: { family: 'IBM Plex Sans', weight: '600' } }, grid: { display: false } } } }
  });
}

async function loadAreaData() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error(`CSV request returned ${response.status}`);
    const parsed = Papa.parse(await response.text(), { header: true, skipEmptyLines: true, dynamicTyping: false });
    const fields = parsed.meta.fields || [];
    if (REQUIRED_HEADERS.some((header) => !fields.includes(header))) throw new Error('The LULC CSV does not contain the required columns.');
    areaData = parsed.data.map((row) => ({ class_id: Number(row.class_id), class_name: String(row.class_name || '').trim(), area_km2: Number(row.area_km2), area_percent: Number(row.area_percent) })).filter((row) => row.class_name && Number.isFinite(row.class_id) && Number.isFinite(row.area_km2) && Number.isFinite(row.area_percent)).sort((a, b) => a.class_id - b.class_id);
    if (!areaData.length) throw new Error('The LULC CSV has no valid class rows.');
    renderTable(areaData); renderInterpretation(areaData); setStatus();
  } catch (error) {
    setStatus(`Unable to load the class-area data: ${error.message}`);
    document.querySelector('#interpretation-text').textContent = 'The exported class-area CSV could not be loaded.';
  }
}

setupTabs(); configureRepositoryLink(); loadAreaData();
