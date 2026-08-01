const REPOSITORY_URL = '';
const CSV_URL = './Data/Hyderabad_LULC_Change_Statistics.csv';
const REQUIRED_HEADERS = ['Class_ID', 'Class_Name', 'Area_2021_km2', 'Area_2025_km2', 'Change_km2'];
const CLASS_COLORS = { 'Built-up': '#ff0000', Waterbody: '#28C4FA', Forest: '#0c922c', 'Barren Land': '#ffd217', 'Floating Veg': '#0000ff' };
const CLASS_ORDER = ['Built-up', 'Waterbody', 'Forest', 'Barren Land', 'Floating Veg'];
const DISPLAY_NAMES = { 'Floating Veg': 'Floating Vegetation' };
function displayName(name) { return DISPLAY_NAMES[name] || name; }

// Accuracy figures supplied directly from the project owner's Earth Engine
// validation output for each classification year. These are not derived
// from the area CSV, so they are recorded here as fixed reference values.
const ACCURACY = {
  2021: {
    overall: 0.9601149838303988,
    kappa: 0.9427888271833472,
    perClass: {
      'Built-up': { producer: 0.9684094139946297, user: 0.9973971042785098 },
      Waterbody: { producer: 0.976850441669205, user: 0.9828378792522219 },
      Forest: { producer: 0.9749325106054763, user: 0.9057685417413114 },
      'Barren Land': { producer: 0.9125560538116592, user: 0.8514644351464435 },
      'Floating Veg': { producer: 0.8613312202852615, user: 0.8794498381877023 }
    }
  },
  2025: {
    overall: 0.9744160977362558,
    kappa: 0.9630527996640477,
    perClass: {
      'Built-up': { producer: 0.9951034591691675, user: 0.9973088491372487 },
      Waterbody: { producer: 1, user: 1 },
      Forest: { producer: 0.9718472811415348, user: 0.9081081081081082 },
      'Barren Land': { producer: 0.9618834080717489, user: 0.975 },
      'Floating Veg': { producer: 0.8137876386687797, user: 0.9336363636363636 }
    }
  }
};

let changeData = [];
let areaChart;

function validUrl(value) { try { return new URL(value).protocol === 'https:'; } catch { return false; } }
function number(value, digits = 2) { return Number.isFinite(value) ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value) : 'No data'; }
function percent(value, digits = 1) { return Number.isFinite(value) ? `${(value * 100).toFixed(digits)}%` : 'No data'; }
function slug(name) { return name.toLowerCase().replace(/[^a-z0-9]/g, ''); }
function setStatus(message = '') { const el = document.querySelector('#data-status'); if (el) el.textContent = message; }

function configureRepositoryLink() {
  if (!validUrl(REPOSITORY_URL)) return;
  const link = document.querySelector('#repository-link');
  link.href = REPOSITORY_URL;
  document.querySelector('#repository-slot').hidden = false;
  document.querySelector('.repo-placeholder').hidden = true;
}

function renderAreaTable(rows) {
  const body = document.querySelector('#area-table tbody');
  body.replaceChildren();
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = CLASS_COLORS[row.name] || '#ffffff';
    const name = document.createElement('td'); name.append(swatch, document.createTextNode(displayName(row.name)));
    const a21 = document.createElement('td'); a21.textContent = `${number(row.area2021)} km²`;
    const p21 = document.createElement('td'); p21.textContent = `${number(row.percent2021)}%`;
    const a25 = document.createElement('td'); a25.textContent = `${number(row.area2025)} km²`;
    const p25 = document.createElement('td'); p25.textContent = `${number(row.percent2025)}%`;
    tr.append(name, a21, p21, a25, p25); body.append(tr);
  });
}

function renderAccuracyTable() {
  const body = document.querySelector('#accuracy-table tbody');
  if (!body) return;
  body.replaceChildren();
  CLASS_ORDER.forEach((name) => {
    const y21 = ACCURACY[2021].perClass[name];
    const y25 = ACCURACY[2025].perClass[name];
    const tr = document.createElement('tr');
    [displayName(name), percent(y21.producer), percent(y21.user), percent(y25.producer), percent(y25.user)].forEach((value) => {
      const td = document.createElement('td'); td.textContent = value; tr.append(td);
    });
    body.append(tr);
  });
}

function renderChangeCards(rows) {
  const target = document.querySelector('#change-cards');
  target.replaceChildren();
  rows.forEach((row) => {
    const direction = row.change > 0 ? 'Grew' : row.change < 0 ? 'Shrank' : 'No change';
    const card = document.createElement('article');
    card.className = `change-card ${slug(row.name)}`;
    card.innerHTML = `<h3>${displayName(row.name)}</h3><span class="change-direction">${direction}</span><dl>
      <div><dt>2021</dt><dd>${number(row.area2021)} km²</dd></div>
      <div><dt>2025</dt><dd>${number(row.area2025)} km²</dd></div>
      <div><dt>Change</dt><dd>${row.change > 0 ? '+' : ''}${number(row.change)} km²</dd></div>
      <div><dt>Percent change</dt><dd>${row.changePercent > 0 ? '+' : ''}${number(row.changePercent)}%</dd></div>
    </dl>`;
    target.append(card);
  });
}

function insightCard(title, points) {
  const article = document.createElement('article');
  article.className = 'insight-card';
  const h3 = document.createElement('h3'); h3.textContent = title;
  const ul = document.createElement('ul');
  points.forEach((point) => { const li = document.createElement('li'); li.textContent = point; ul.append(li); });
  article.append(h3, ul);
  return article;
}

function renderInterpretation(rows) {
  const byName = Object.fromEntries(rows.map((row) => [row.name, row]));
  const built = byName['Built-up'];
  const water = byName.Waterbody;
  const forest = byName.Forest;
  const barren = byName['Barren Land'];
  const floating = byName['Floating Veg'];

  const cards = [
    insightCard('Built-up land crept outward', [
      `${number(built.area2021, 0)} km² in 2021 to ${number(built.area2025, 0)} km² in 2025, up about ${number(built.changePercent, 0)} percent.`,
      `A modest, steady rise, in line with a city that keeps adding roads and buildings each year.`
    ]),
    insightCard('Green cover and water both grew', [
      `Forest went from ${number(forest.area2021, 0)} to ${number(forest.area2025, 0)} km², up about ${number(forest.changePercent, 0)} percent.`,
      `Water went from ${number(water.area2021, 1)} to ${number(water.area2025, 1)} km².`,
      `Could reflect real tree planting and lake work, but season and rainfall on the day each image was taken also play a part.`
    ]),
    insightCard('Bare ground and floating plants both shrank', [
      `Barren land went from ${number(barren.area2021, 1)} to ${number(barren.area2025, 1)} km², down sharply.`,
      `Floating vegetation went from ${number(floating.area2021, 1)} to ${number(floating.area2025, 1)} km², also down sharply.`,
      `Likely a mix of new construction, new greenery, and lake cleanup or desilting work.`
    ]),
    insightCard('How much to trust these numbers', [
      `Model accuracy was 96.0 percent in 2021 and 97.4 percent in 2025, checked against real reference points.`,
      `Kappa coefficient (agreement beyond random chance) was 0.94 in 2021 and 0.96 in 2025, both strong scores.`,
      `Floating vegetation was the hardest class to pin down in both years, so treat that change figure as approximate.`
    ])
  ];

  const target = document.querySelector('#interpretation-grid');
  target.replaceChildren(...cards);
}

function renderAreaChart(rows) {
  if (!rows.length || areaChart) return;
  areaChart = new Chart(document.querySelector('#area-chart'), {
    type: 'bar',
    data: {
      labels: rows.map((row) => displayName(row.name)),
      datasets: [
        { label: '2021', data: rows.map((row) => row.area2021), backgroundColor: rows.map((row) => `${CLASS_COLORS[row.name]}88`), borderColor: '#171717', borderWidth: 2 },
        { label: '2025', data: rows.map((row) => row.area2025), backgroundColor: rows.map((row) => CLASS_COLORS[row.name]), borderColor: '#171717', borderWidth: 2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 180 },
      plugins: {
        legend: { position: 'top', labels: { font: { family: 'IBM Plex Mono', size: 12 } } },
        tooltip: {
          callbacks: {
            label: (context) => {
              const row = rows[context.dataIndex];
              const share = context.dataset.label === '2021' ? row.percent2021 : row.percent2025;
              return `${context.dataset.label}: ${number(context.raw)} km² (${number(share)}% of classified area)`;
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Land cover class', font: { family: 'IBM Plex Mono', weight: '600' } }, ticks: { font: { family: 'IBM Plex Sans', weight: '600' } }, grid: { display: false } },
        y: { title: { display: true, text: 'Area (square kilometres)', font: { family: 'IBM Plex Mono', weight: '600' } }, ticks: { font: { family: 'IBM Plex Mono' } }, grid: { color: '#ded7c9' } }
      }
    }
  });
}

async function loadChangeData() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error(`CSV request returned ${response.status}`);
    const parsed = Papa.parse(await response.text(), { header: true, skipEmptyLines: true, dynamicTyping: false });
    const fields = parsed.meta.fields || [];
    if (REQUIRED_HEADERS.some((header) => !fields.includes(header))) throw new Error('The change CSV does not contain the required columns.');
    const rawRows = parsed.data
      .map((row) => ({
        classId: Number(row.Class_ID),
        name: String(row.Class_Name || '').trim(),
        area2021: Number(row.Area_2021_km2),
        area2025: Number(row.Area_2025_km2),
        change: Number(row.Change_km2)
      }))
      .filter((row) => row.name && Number.isFinite(row.classId) && Number.isFinite(row.area2021) && Number.isFinite(row.area2025))
      .sort((a, b) => a.classId - b.classId);
    if (!rawRows.length) throw new Error('The change CSV has no valid class rows.');

    const total2021 = rawRows.reduce((sum, row) => sum + row.area2021, 0);
    const total2025 = rawRows.reduce((sum, row) => sum + row.area2025, 0);
    changeData = rawRows.map((row) => ({
      ...row,
      percent2021: (row.area2021 / total2021) * 100,
      percent2025: (row.area2025 / total2025) * 100,
      changePercent: row.area2021 === 0 ? 0 : (row.change / row.area2021) * 100
    }));

    renderAreaTable(changeData);
    renderAccuracyTable();
    renderChangeCards(changeData);
    renderInterpretation(changeData);
    renderAreaChart(changeData);
    setStatus();
  } catch (error) {
    setStatus(`Unable to load the class-area data: ${error.message}`);
    const grid = document.querySelector('#interpretation-grid');
    if (grid) grid.replaceChildren(Object.assign(document.createElement('p'), { className: 'insight-loading', textContent: 'The class-area CSV could not be loaded.' }));
  }
}

configureRepositoryLink();
loadChangeData();
