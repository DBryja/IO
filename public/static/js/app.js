// Application state
let currentOrganizerId = null;
let currentTab = 'create';

// API base URL
const API_BASE = '/api';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Event Management System Frontend - Starting...');
    
    // Generate or get organizer ID
    currentOrganizerId = localStorage.getItem('organizerId') || generateOrganizerId();
    localStorage.setItem('organizerId', currentOrganizerId);
    
    // Update UI
    updateOrganizerInfo();
    setupEventListeners();
    initializeTabs();
    
    // Load initial data
    loadOrganizerEvents();
    loadPublicEvents();
    loadStats();
    
    console.log('✅ Frontend initialized successfully');
});

// Generate unique organizer ID
function generateOrganizerId() {
    return 'organizer-' + Math.random().toString(36).substr(2, 9);
}

// Update organizer info in header
function updateOrganizerInfo() {
    const organizerName = document.getElementById('organizer-name');
    organizerName.textContent = currentOrganizerId;
}

// Setup event listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Change organizer
    document.getElementById('change-organizer').addEventListener('click', function() {
        currentOrganizerId = generateOrganizerId();
        localStorage.setItem('organizerId', currentOrganizerId);
        updateOrganizerInfo();
        showMessage('Zmieniono organizatora', 'info');
        loadOrganizerEvents();
    });

    // Create event form
    document.getElementById('create-event-form').addEventListener('submit', handleCreateEvent);

    // Location type change
    document.querySelectorAll('input[name="location-type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const addressGroup = document.getElementById('address-group');
            if (this.value === 'online') {
                addressGroup.style.display = 'none';
                document.getElementById('event-address').required = false;
            } else {
                addressGroup.style.display = 'block';
                document.getElementById('event-address').required = true;
            }
        });
    });

    // Ticket type change
    document.getElementById('ticket-type').addEventListener('change', function() {
        const priceGroup = document.getElementById('price-group');
        const ticketPrice = document.getElementById('ticket-price');
        
        if (this.value === 'paid') {
            priceGroup.style.display = 'block';
            ticketPrice.required = true;
        } else {
            priceGroup.style.display = 'none';
            ticketPrice.required = false;
        }
    });

    // Refresh buttons
    document.getElementById('refresh-events').addEventListener('click', loadOrganizerEvents);
    document.getElementById('refresh-catalog').addEventListener('click', loadPublicEvents);
    document.getElementById('refresh-stats').addEventListener('click', loadStats);

    // Modal
    document.getElementById('edit-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    document.querySelector('.modal-close').addEventListener('click', closeModal);
}

// Initialize tabs
function initializeTabs() {
    switchTab('create');
}

// Switch between tabs
function switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    currentTab = tabName;

    // Load data for specific tabs
    if (tabName === 'manage') {
        loadOrganizerEvents();
    } else if (tabName === 'catalog') {
        loadPublicEvents();
    } else if (tabName === 'stats') {
        loadStats();
    }
}

// Handle create event form submission
async function handleCreateEvent(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const locationType = document.querySelector('input[name="location-type"]:checked').value;
    
    const eventData = {
        organizerId: currentOrganizerId,
        name: formData.get('event-name') || document.getElementById('event-name').value,
        description: formData.get('event-description') || document.getElementById('event-description').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        isOnline: locationType === 'online',
        address: locationType === 'offline' ? document.getElementById('event-address').value : undefined,
        eventType: document.getElementById('event-type').value,
        ticketType: document.getElementById('ticket-type').value,
        ticketPrice: document.getElementById('ticket-type').value === 'paid' 
            ? parseFloat(document.getElementById('ticket-price').value) : undefined,
        currency: document.getElementById('currency').value
    };

    try {
        showMessage('Tworzenie wydarzenia...', 'info');
        
        const response = await fetch(`${API_BASE}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('✅ Wydarzenie zostało utworzone pomyślnie!', 'success');
            e.target.reset();
            
            // Switch to management tab to show the new event
            switchTab('manage');
        } else {
            showMessage(`❌ Błąd: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error creating event:', error);
        showMessage(`❌ Błąd sieci: ${error.message}`, 'error');
    }
}

// Load organizer events
async function loadOrganizerEvents() {
    const container = document.getElementById('organizer-events');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Ładowanie wydarzeń...</div>';

    try {
        const response = await fetch(`${API_BASE}/events/organizer/${currentOrganizerId}`);
        const result = await response.json();

        if (result.success) {
            displayOrganizerEvents(result.data);
        } else {
            container.innerHTML = `<div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Błąd ładowania</h3>
                <p>${result.error}</p>
            </div>`;
        }
    } catch (error) {
        console.error('Error loading organizer events:', error);
        container.innerHTML = `<div class="empty-state">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Błąd sieci</h3>
            <p>Nie można połączyć się z serwerem</p>
        </div>`;
    }
}

// Display organizer events
function displayOrganizerEvents(events) {
    const container = document.getElementById('organizer-events');
    
    if (events.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <i class="fas fa-calendar-plus"></i>
            <h3>Brak wydarzeń</h3>
            <p>Nie masz jeszcze żadnych wydarzeń. Utwórz swoje pierwsze wydarzenie!</p>
        </div>`;
        return;
    }

    container.innerHTML = events.map(event => createEventCard(event, true)).join('');
}

// Load public events
async function loadPublicEvents() {
    const container = document.getElementById('public-events');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Ładowanie wydarzeń...</div>';

    try {
        const response = await fetch(`${API_BASE}/events/published`);
        const result = await response.json();

        if (result.success) {
            displayPublicEvents(result.data);
        } else {
            container.innerHTML = `<div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Błąd ładowania</h3>
                <p>${result.error}</p>
            </div>`;
        }
    } catch (error) {
        console.error('Error loading public events:', error);
        container.innerHTML = `<div class="empty-state">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Błąd sieci</h3>
            <p>Nie można połączyć się z serwerem</p>
        </div>`;
    }
}

// Display public events
function displayPublicEvents(events) {
    const container = document.getElementById('public-events');
    
    if (events.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <i class="fas fa-globe"></i>
            <h3>Brak publicznych wydarzeń</h3>
            <p>Nie ma jeszcze żadnych opublikowanych wydarzeń.</p>
        </div>`;
        return;
    }

    container.innerHTML = events.map(event => createEventCard(event, false)).join('');
}

// Create event card HTML
function createEventCard(event, isOwnEvent) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const price = event.ticketPrice ? `${event.ticketPrice.amount} ${event.ticketPrice.currency}` : 'Bezpłatne';
    
    const actions = isOwnEvent ? `
        <div class="event-actions">
            <button class="btn btn-sm btn-warning" onclick="editEvent('${event.id}')">
                <i class="fas fa-edit"></i> Edytuj
            </button>
            ${!event.isPublished ? `
                <button class="btn btn-sm btn-success" onclick="publishEvent('${event.id}')">
                    <i class="fas fa-globe"></i> Publikuj
                </button>
            ` : ''}
        </div>
    ` : '';

    return `
        <div class="event-card">
            <h3>${event.name}</h3>
            <div class="event-meta">
                <span class="event-badge ${event.isPublished ? 'badge-published' : 'badge-draft'}">
                    ${event.isPublished ? 'Opublikowane' : 'Szkic'}
                </span>
                <span class="event-badge ${event.eventType === 'public' ? 'badge-public' : 'badge-private'}">
                    ${event.eventType === 'public' ? 'Publiczne' : 'Prywatne'}
                </span>
                <span class="event-badge ${event.ticketType === 'free' ? 'badge-free' : 'badge-paid'}">
                    ${price}
                </span>
            </div>
            <p class="event-description">${event.description}</p>
            <div class="event-details">
                <i class="fas fa-calendar"></i>
                <span>${startDate.toLocaleDateString('pl-PL')} ${startDate.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}</span>
                <i class="fas fa-clock"></i>
                <span>do ${endDate.toLocaleDateString('pl-PL')} ${endDate.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}</span>
                <i class="fas fa-${event.location.isOnline ? 'laptop' : 'map-marker-alt'}"></i>
                <span>${event.location.isOnline ? 'Online' : (event.location.address || 'Lokalizacja do ustalenia')}</span>
            </div>
            ${actions}
        </div>
    `;
}

// Edit event
async function editEvent(eventId) {
    try {
        // Fetch event details
        const response = await fetch(`${API_BASE}/events/${eventId}`);
        const result = await response.json();

        if (result.success && result.data) {
            showEditModal(result.data);
        } else {
            showMessage(`❌ Błąd: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        showMessage(`❌ Błąd sieci: ${error.message}`, 'error');
    }
}

// Show edit modal
function showEditModal(event) {
    const modal = document.getElementById('edit-modal');
    const form = document.getElementById('edit-event-form');
    
    // Populate form with event data
    const startDate = new Date(event.startDate).toISOString().slice(0, 16);
    const endDate = new Date(event.endDate).toISOString().slice(0, 16);
    
    form.innerHTML = `
        <input type="hidden" id="edit-event-id" value="${event.id}">
        
        <div class="form-group">
            <label for="edit-event-name">Nazwa wydarzenia *</label>
            <input type="text" id="edit-event-name" value="${event.name}" required>
        </div>

        <div class="form-group">
            <label for="edit-event-description">Opis wydarzenia *</label>
            <textarea id="edit-event-description" rows="4" required>${event.description}</textarea>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="edit-start-date">Data rozpoczęcia *</label>
                <input type="datetime-local" id="edit-start-date" value="${startDate}" required>
            </div>
            <div class="form-group">
                <label for="edit-end-date">Data zakończenia *</label>
                <input type="datetime-local" id="edit-end-date" value="${endDate}" required>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Lokalizacja</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="edit-location-type" value="offline" ${!event.location.isOnline ? 'checked' : ''}>
                        <span>Stacjonarnie</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="edit-location-type" value="online" ${event.location.isOnline ? 'checked' : ''}>
                        <span>Online</span>
                    </label>
                </div>
            </div>
        </div>

        <div class="form-group" id="edit-address-group" ${event.location.isOnline ? 'style="display: none;"' : ''}>
            <label for="edit-event-address">Adres</label>
            <input type="text" id="edit-event-address" value="${event.location.address || ''}">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="edit-event-type">Typ wydarzenia</label>
                <select id="edit-event-type">
                    <option value="public" ${event.eventType === 'public' ? 'selected' : ''}>Publiczne</option>
                    <option value="private" ${event.eventType === 'private' ? 'selected' : ''}>Prywatne</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-ticket-type">Typ biletów</label>
                <select id="edit-ticket-type">
                    <option value="free" ${event.ticketType === 'free' ? 'selected' : ''}>Bezpłatne</option>
                    <option value="paid" ${event.ticketType === 'paid' ? 'selected' : ''}>Płatne</option>
                </select>
            </div>
        </div>

        <div class="form-row" id="edit-price-group" ${event.ticketType === 'free' ? 'style="display: none;"' : ''}>
            <div class="form-group">
                <label for="edit-ticket-price">Cena biletu</label>
                <div class="price-input">
                    <input type="number" id="edit-ticket-price" min="0" step="0.01" 
                           value="${event.ticketPrice ? event.ticketPrice.amount : ''}">
                    <select id="edit-currency">
                        <option value="PLN" ${event.ticketPrice?.currency === 'PLN' ? 'selected' : ''}>PLN</option>
                        <option value="USD" ${event.ticketPrice?.currency === 'USD' ? 'selected' : ''}>USD</option>
                        <option value="EUR" ${event.ticketPrice?.currency === 'EUR' ? 'selected' : ''}>EUR</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="form-actions">
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Zapisz zmiany
            </button>
            <button type="button" class="btn btn-secondary" onclick="closeModal()">
                <i class="fas fa-times"></i> Anuluj
            </button>
        </div>
    `;
    
    // Setup form event listeners
    setupEditFormListeners();
    
    // Show modal
    modal.classList.add('active');
}

// Setup edit form listeners
function setupEditFormListeners() {
    // Location type change
    document.querySelectorAll('input[name="edit-location-type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const addressGroup = document.getElementById('edit-address-group');
            if (this.value === 'online') {
                addressGroup.style.display = 'none';
            } else {
                addressGroup.style.display = 'block';
            }
        });
    });

    // Ticket type change
    document.getElementById('edit-ticket-type').addEventListener('change', function() {
        const priceGroup = document.getElementById('edit-price-group');
        if (this.value === 'paid') {
            priceGroup.style.display = 'block';
        } else {
            priceGroup.style.display = 'none';
        }
    });

    // Form submission
    document.getElementById('edit-event-form').addEventListener('submit', handleEditEvent);
}

// Handle edit event form submission
async function handleEditEvent(e) {
    e.preventDefault();
    
    const eventId = document.getElementById('edit-event-id').value;
    const locationType = document.querySelector('input[name="edit-location-type"]:checked').value;
    
    const eventData = {
        name: document.getElementById('edit-event-name').value,
        description: document.getElementById('edit-event-description').value,
        startDate: document.getElementById('edit-start-date').value,
        endDate: document.getElementById('edit-end-date').value,
        isOnline: locationType === 'online',
        address: locationType === 'offline' ? document.getElementById('edit-event-address').value : undefined,
        eventType: document.getElementById('edit-event-type').value,
        ticketType: document.getElementById('edit-ticket-type').value,
        ticketPrice: document.getElementById('edit-ticket-type').value === 'paid' 
            ? parseFloat(document.getElementById('edit-ticket-price').value) : undefined,
        currency: document.getElementById('edit-currency').value
    };

    try {
        showMessage('Aktualizowanie wydarzenia...', 'info');
        
        const response = await fetch(`${API_BASE}/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('✅ Wydarzenie zostało zaktualizowane!', 'success');
            closeModal();
            loadOrganizerEvents();
        } else {
            showMessage(`❌ Błąd: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error updating event:', error);
        showMessage(`❌ Błąd sieci: ${error.message}`, 'error');
    }
}

// Publish event
async function publishEvent(eventId) {
    try {
        showMessage('Publikowanie wydarzenia...', 'info');
        
        const response = await fetch(`${API_BASE}/events/${eventId}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (result.success) {
            showMessage('✅ Wydarzenie zostało opublikowane!', 'success');
            loadOrganizerEvents();
            loadPublicEvents();
        } else {
            showMessage(`❌ Błąd: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error publishing event:', error);
        showMessage(`❌ Błąd sieci: ${error.message}`, 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('edit-modal').classList.remove('active');
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const result = await response.json();

        if (result.success) {
            document.getElementById('total-events').textContent = result.data.totalEvents;
            document.getElementById('published-events').textContent = result.data.publishedEvents;
            document.getElementById('draft-events').textContent = result.data.draftEvents;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Show message
function showMessage(text, type = 'info') {
    const container = document.getElementById('message-container');
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 'info-circle';
    
    message.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${text}</span>
    `;
    
    container.appendChild(message);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 5000);
}
