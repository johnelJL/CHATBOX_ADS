const storageKey = 'classifai-cars:listings';
const statsKey = 'classifai-cars:stats';

const defaultListings = [
  {
    id: crypto.randomUUID(),
    title: '2020 Tesla Model 3 Long Range',
    price: 38900,
    mileage: 42000,
    year: 2020,
    location: 'Athens',
    status: 'active',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    highlights: ['Autopilot included', 'Dual motor AWD', 'Full service history'],
    description:
      'Single owner Model 3 in pristine condition. Battery health at 94%, recently serviced with new tires. Includes Enhanced Autopilot package and premium connectivity.',
    insights: ['Recommended price band €37.9k-€39.9k', '0 safety concerns detected', 'Photos cover interior/exterior'],
  },
  {
    id: crypto.randomUUID(),
    title: '2018 BMW 320d M Sport Touring',
    price: 22900,
    mileage: 86000,
    year: 2018,
    location: 'Thessaloniki',
    status: 'active',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    highlights: ['Adaptive cruise control', 'Harman/Kardon audio', 'Panoramic sunroof'],
    description:
      'Company-maintained wagon with full history at BMW. Recently replaced brake discs and pads. Includes winter tires and roof rack.',
    insights: ['AI redaction applied to license plates', 'Safety checklist cleared', 'Market demand high in Q1'],
  },
  {
    id: crypto.randomUUID(),
    title: '2015 Toyota Yaris Hybrid Lounge',
    price: 10900,
    mileage: 98000,
    year: 2015,
    location: 'Patras',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 90,
    highlights: ['Wireless CarPlay retrofit', 'Two sets of tires', 'Serviced February 2024'],
    description:
      'City-friendly hatchback with excellent fuel economy. Dealer maintained with receipts. Minor bumper scuff flagged for review.',
    insights: ['AI suggests exterior polish to increase appeal', 'Plate redaction verified', 'Pending moderator approval'],
  },
  {
    id: crypto.randomUUID(),
    title: '2012 Volkswagen Golf 1.4 TSI DSG',
    price: 8200,
    mileage: 148000,
    year: 2012,
    location: 'Heraklion',
    status: 'flagged',
    createdAt: Date.now() - 1000 * 60 * 30,
    highlights: ['DSG serviced 5k km ago', 'Sports package', 'New tires'],
    description:
      'Well-maintained Golf with service book. AI detected potential odometer discrepancy with service logs – requires manual verification.',
    insights: ['Potential mileage mismatch flagged', 'Request odometer verification photo', 'Seller notified for follow-up'],
  },
];

const defaultStats = {
  avgTime: '6m',
  verified: '2.4k',
  redactions: '18k',
  pending: 0,
  flagged: 0,
  approvedToday: 14,
};

const listingContainer = document.querySelector('[data-listings]');
const emptyState = document.querySelector('[data-empty]');
const queueContainer = document.querySelector('[data-queue]');
const emptyQueue = document.querySelector('[data-empty-queue]');
const statsElements = {
  avgTime: document.querySelector('[data-stat="avg-time"]'),
  verified: document.querySelector('[data-stat="verified"]'),
  redactions: document.querySelector('[data-stat="redactions"]'),
  pending: document.querySelector('[data-stat="pending"]'),
  flagged: document.querySelector('[data-stat="flagged"]'),
  approvedToday: document.querySelector('[data-stat="approved"]'),
};

const dialog = document.querySelector('#listing-dialog');
const dialogTitle = document.querySelector('[data-dialog-title]');
const dialogMeta = document.querySelector('[data-dialog-meta]');
const dialogHighlights = document.querySelector('[data-dialog-highlights]');
const dialogDescription = document.querySelector('[data-dialog-description]');
const dialogInsights = document.querySelector('[data-dialog-insights]');
const closeButtons = document.querySelectorAll('[data-close-dialog]');

const filterState = {
  search: '',
  status: 'all',
  sort: 'recommended',
};

const form = document.querySelector('#listing-form');
const formStatus = document.querySelector('[data-form-status]');
const searchInput = document.querySelector('#search');
const statusFilter = document.querySelector('#status-filter');
const sortOrder = document.querySelector('#sort-order');
const themeToggle = document.querySelector('[data-action="toggle-theme"]');
const seedButton = document.querySelector('[data-action="seed-data"]');
const yearEl = document.getElementById('year');

let listings = loadListings();
let stats = loadStats();

initialize();

function initialize() {
  updateStats();
  renderListings();
  renderQueue();
  setupEvents();
  yearEl.textContent = new Date().getFullYear();
}

function loadListings() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      saveListings(defaultListings);
      return [...defaultListings];
    }
    const parsed = JSON.parse(stored);
    return parsed.map((item) => ({ ...item, createdAt: item.createdAt ?? Date.now() }));
  } catch (error) {
    console.warn('Unable to load listings from storage, using defaults', error);
    return [...defaultListings];
  }
}

function saveListings(value) {
  listings = value;
  try {
    localStorage.setItem(storageKey, JSON.stringify(listings));
  } catch (error) {
    console.warn('Storage unavailable', error);
  }
}

function loadStats() {
  try {
    const stored = localStorage.getItem(statsKey);
    if (!stored) {
      saveStats(defaultStats);
      return { ...defaultStats };
    }
    return { ...defaultStats, ...JSON.parse(stored) };
  } catch (error) {
    console.warn('Unable to load stats', error);
    return { ...defaultStats };
  }
}

function saveStats(value) {
  stats = value;
  try {
    localStorage.setItem(statsKey, JSON.stringify(stats));
  } catch (error) {
    console.warn('Storage unavailable', error);
  }
}

function setupEvents() {
  searchInput.addEventListener('input', (event) => {
    filterState.search = event.target.value.trim().toLowerCase();
    renderListings();
  });

  statusFilter.addEventListener('change', (event) => {
    filterState.status = event.target.value;
    renderListings();
    renderQueue();
  });

  sortOrder.addEventListener('change', (event) => {
    filterState.sort = event.target.value;
    renderListings();
  });

  form.addEventListener('submit', handleSubmit);

  themeToggle?.addEventListener('click', toggleTheme);

  seedButton?.addEventListener('click', () => {
    saveListings([...defaultListings.map((item) => ({ ...item, id: crypto.randomUUID() }))]);
    renderListings();
    renderQueue();
  });

  listingContainer.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    const { action, id } = target.dataset;
    if (action === 'view') {
      openDialog(id);
    }
  });

  queueContainer.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const id = button.dataset.id;
    const action = button.dataset.action;
    if (!id || !action) return;

    if (action === 'approve') {
      updateListingStatus(id, 'active');
      updateApprovalStats();
    } else if (action === 'flag') {
      updateListingStatus(id, 'flagged');
    } else if (action === 'note') {
      requestNotes(id);
    }

    renderListings();
    renderQueue();
  });

  closeButtons.forEach((button) =>
    button.addEventListener('click', () => {
      if (dialog.open) dialog.close();
    }),
  );

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    dialog.close();
  });
}

function toggleTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  if (dark) {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = 'light';
  } else {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
  }
}

function updateStats() {
  stats.pending = listings.filter((item) => item.status === 'pending').length;
  stats.flagged = listings.filter((item) => item.status === 'flagged').length;

  statsElements.avgTime.textContent = stats.avgTime;
  statsElements.verified.textContent = stats.verified;
  statsElements.redactions.textContent = stats.redactions;
  statsElements.pending.textContent = stats.pending;
  statsElements.flagged.textContent = stats.flagged;
  statsElements.approvedToday.textContent = stats.approvedToday;

  saveStats(stats);
}

function renderListings() {
  const filtered = listings
    .filter((item) => {
      if (filterState.status !== 'all' && item.status !== filterState.status) return false;
      if (!filterState.search) return true;
      const haystack = [item.title, item.location, item.description, ...(item.highlights ?? [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(filterState.search);
    })
    .sort((a, b) => applySort(a, b, filterState.sort));

  listingContainer.innerHTML = '';

  if (!filtered.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  filtered.forEach((listing) => {
    const card = document.createElement('article');
    card.className = 'card listing-card';
    card.innerHTML = `
      <header>
        <div>
          <h3>${listing.title}</h3>
          <div class="meta">
            <span>${listing.year}</span>
            <span>${formatNumber(listing.mileage)} km</span>
            <span>${listing.location}</span>
          </div>
        </div>
        <span class="badge" data-status="${listing.status}">${toLabel(listing.status)}</span>
      </header>
      <ul class="pill-list">
        ${(listing.highlights ?? []).map((highlight) => `<li>${highlight}</li>`).join('')}
      </ul>
      <p>${listing.description}</p>
      <footer>
        <span class="price">€${formatNumber(listing.price)}</span>
        <button class="secondary" data-action="view" data-id="${listing.id}" type="button">View details</button>
      </footer>
    `;
    listingContainer.appendChild(card);
  });
}

function applySort(a, b, mode) {
  switch (mode) {
    case 'newest':
      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    case 'price-low':
      return a.price - b.price;
    case 'price-high':
      return b.price - a.price;
    case 'mileage-low':
      return a.mileage - b.mileage;
    case 'mileage-high':
      return b.mileage - a.mileage;
    default: {
      const score = (item) => {
        const freshness = Math.max(0, 1 - (Date.now() - (item.createdAt ?? Date.now())) / (1000 * 60 * 60 * 48));
        const statusScore = item.status === 'active' ? 1 : item.status === 'pending' ? 0.6 : 0.3;
        return freshness * 0.6 + statusScore * 0.4;
      };
      return score(b) - score(a);
    }
  }
}

function renderQueue() {
  queueContainer.innerHTML = '';
  const queued = listings.filter((item) => item.status !== 'active');

  if (!queued.length) {
    emptyQueue.hidden = false;
    updateStats();
    return;
  }

  emptyQueue.hidden = true;

  queued
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .forEach((item) => {
      const li = document.createElement('li');
      li.className = 'queue-item';
      li.innerHTML = `
        <header>
          <div>
            <h4>${item.title}</h4>
            <p class="meta">${item.year} • ${formatNumber(item.mileage)} km • ${item.location}</p>
          </div>
          <span class="badge" data-status="${item.status}">${toLabel(item.status)}</span>
        </header>
        <p>${item.description}</p>
        <div class="queue-actions">
          <button class="approve" data-action="approve" data-id="${item.id}" type="button">Approve</button>
          <button class="flag" data-action="flag" data-id="${item.id}" type="button">Flag safety issue</button>
          <button class="notes" data-action="note" data-id="${item.id}" type="button">Request notes</button>
        </div>
      `;
      queueContainer.appendChild(li);
    });

  updateStats();
}

function toLabel(status) {
  switch (status) {
    case 'active':
      return 'Live';
    case 'pending':
      return 'Pending review';
    case 'flagged':
      return 'Safety flagged';
    default:
      return status;
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('el-GR').format(value);
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  const listing = {
    id: crypto.randomUUID(),
    title: payload.title.trim(),
    price: Number(payload.price),
    mileage: Number(payload.mileage),
    year: Number(payload.year),
    location: payload.location.trim(),
    status: 'pending',
    createdAt: Date.now(),
    highlights: payload.highlights
      ? payload.highlights
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    description: payload.description?.trim() || generateDescription(payload),
    insights: buildInsights(payload),
  };

  if (!listing.title || !listing.price || !listing.mileage || !listing.year || !listing.location) {
    formStatus.textContent = 'Please complete all required fields.';
    return;
  }

  formStatus.textContent = 'Generating AI summary...';
  formStatus.dataset.state = 'loading';

  setTimeout(() => {
    saveListings([listing, ...listings]);
    form.reset();
    formStatus.textContent = 'Listing submitted for review. Check the moderation queue for status updates.';
    formStatus.dataset.state = 'success';
    renderListings();
    renderQueue();
  }, 800);
}

function generateDescription(payload) {
  const title = payload.title.trim();
  const extras = payload.highlights
    ? payload.highlights
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const extrasSentence = extras.length ? ` Key highlights include ${extras.join(', ')}.` : '';
  return `${title} with ${formatNumber(Number(payload.mileage))} km and full documentation provided.${extrasSentence}`;
}

function buildInsights(payload) {
  const suggestions = [];
  const price = Number(payload.price);
  const mileage = Number(payload.mileage);
  const year = Number(payload.year);
  const age = new Date().getFullYear() - year;

  if (price) {
    const marketBand = [Math.max(price * 0.94, price - 1200), price * 1.06];
    suggestions.push(
      `Market guidance: €${formatNumber(Math.round(marketBand[0]))}-€${formatNumber(Math.round(marketBand[1]))}`,
    );
  }

  if (mileage && age) {
    const avgMileage = age * 15000;
    const delta = mileage - avgMileage;
    if (Math.abs(delta) < avgMileage * 0.15) {
      suggestions.push('Mileage aligned with market average for this age.');
    } else if (delta > 0) {
      suggestions.push('Mileage exceeds typical range — highlight maintenance receipts.');
    } else {
      suggestions.push('Below-average mileage — spotlight this advantage in your description.');
    }
  }

  if (!payload.description?.trim()) {
    suggestions.push('AI drafted description ready for quick publishing.');
  }

  return suggestions;
}

function openDialog(id) {
  const listing = listings.find((item) => item.id === id);
  if (!listing) return;

  dialogTitle.textContent = listing.title;
  dialogMeta.textContent = `${listing.year} • ${formatNumber(listing.mileage)} km • ${listing.location}`;
  dialogDescription.textContent = listing.description;

  dialogHighlights.innerHTML = '';
  if (listing.highlights?.length) {
    listing.highlights.forEach((highlight) => {
      const pill = document.createElement('li');
      pill.textContent = highlight;
      dialogHighlights.appendChild(pill);
    });
  }

  dialogInsights.innerHTML = '';
  listing.insights?.forEach((insight) => {
    const li = document.createElement('li');
    li.textContent = insight;
    dialogInsights.appendChild(li);
  });

  dialog.showModal();
}

function updateListingStatus(id, status) {
  const updated = listings.map((item) => (item.id === id ? { ...item, status } : item));
  saveListings(updated);
}

function updateApprovalStats() {
  const approvedToday = Number(stats.approvedToday) + 1;
  saveStats({ ...stats, approvedToday });
  updateStats();
}

function requestNotes(id) {
  const listing = listings.find((item) => item.id === id);
  if (!listing) return;

  const notes = prompt('Request clarification from seller:', 'Please provide service receipts for the last 24 months.');
  if (!notes) return;

  const updated = listings.map((item) =>
    item.id === id
      ? {
          ...item,
          insights: [...(item.insights ?? []), `Moderator note: ${notes}`],
        }
      : item,
  );

  saveListings(updated);
  renderListings();
  renderQueue();
}

window.addEventListener('storage', (event) => {
  if (event.key === storageKey) {
    listings = loadListings();
    renderListings();
    renderQueue();
  }
  if (event.key === statsKey) {
    stats = loadStats();
    updateStats();
  }
});
