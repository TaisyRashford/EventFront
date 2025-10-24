class EventPlannerApp {
    constructor() {
        this.events = JSON.parse(localStorage.getItem('events') || '[]');
        this.currentView = 'dashboard';
        this.currentDate = new Date();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
        this.updateDateDisplay();
        this.renderCalendar();
        this.createFloatingElements();
    }

    createFloatingElements() {
        const floatingContainer = document.querySelector('.floating-elements');
        if (!floatingContainer) return;

        const emojis = ['🎉', '✨', '🥳', '🎊', '🌟', '🎈', '🎁', '💫', '🌿', '🌸'];
        
        for (let i = 0; i < 8; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.textContent = emojis[i % emojis.length];
            element.style.cssText = `
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 5}s;
                font-size: ${20 + Math.random() * 15}px;
                opacity: ${0.2 + Math.random() * 0.3};
            `;
            floatingContainer.appendChild(element);
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Buttons
        document.getElementById('new-event-btn').addEventListener('click', () => this.showEventModal());
        document.getElementById('add-event-btn').addEventListener('click', () => this.showEventModal());

        // Event Form
        document.getElementById('event-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });

        // Modal Controls
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideEventModal());
        });

        // Calendar Controls
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Close modal when clicking outside
        document.getElementById('event-modal').addEventListener('click', (e) => {
            if (e.target.id === 'event-modal') {
                this.hideEventModal();
            }
        });

        // Search functionality
        const searchInput = document.getElementById('event-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterEvents(e.target.value);
            });
        }
    }

    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}-view`);
        });

        this.currentView = viewName;

        if (viewName === 'calendar') {
            this.renderCalendar();
        } else if (viewName === 'events') {
            this.renderEventsTable();
        }
    }

    showEventModal() {
        document.getElementById('event-modal').classList.add('active');
        document.getElementById('event-form').reset();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('event-date').value = today;
    }

    hideEventModal() {
        document.getElementById('event-modal').classList.remove('active');
    }

    saveEvent() {
        const formData = {
            id: Date.now().toString(),
            name: document.getElementById('event-name').value,
            type: document.getElementById('event-type').value,
            date: document.getElementById('event-date').value,
            location: document.getElementById('event-location').value,
            expectedGuests: parseInt(document.getElementById('expected-guests').value) || 0,
            budget: parseFloat(document.getElementById('event-budget').value) || 0,
            description: document.getElementById('event-description').value,
            status: 'upcoming',
            createdAt: new Date().toISOString()
        };

        this.events.push(formData);
        this.saveToLocalStorage();
        this.updateUI();
        this.hideEventModal();
        
        // Create celebration particles
        this.createParticles(window.innerWidth / 2, window.innerHeight / 2);
        
        // Show celebration message
        this.showCelebration('Event created successfully! 🎉');
    }

    createParticles(x, y) {
        const particles = document.getElementById('particles');
        if (!particles) return;
        
        const colors = ['#27ae60', '#e74c3c', '#3498db', '#f39c12', '#9b59b6'];
        
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.setProperty('--tx', (Math.random() - 0.5) * 100 + 'px');
            particle.style.setProperty('--ty', (Math.random() - 0.5) * 100 + 'px');
            
            particles.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 1000);
        }
    }

    showCelebration(message) {
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 20px 40px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 10px 30px rgba(39, 174, 96, 0.5);
            z-index: 1002;
            animation: celebrationPop 0.5s ease;
        `;
        celebration.textContent = message;
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 2000);
    }

    saveToLocalStorage() {
        localStorage.setItem('events', JSON.stringify(this.events));
    }

    updateUI() {
        this.updateEventCounts();
        this.updateDashboard();
        this.renderEventsTable();
        this.renderCalendar();
    }

    updateEventCounts() {
        const totalEvents = this.events.length;
        const upcomingEvents = this.events.filter(event => 
            new Date(event.date) >= new Date().setHours(0,0,0,0)
        ).length;
        const totalGuests = this.events.reduce((sum, event) => sum + (event.expectedGuests || 0), 0);
        const totalBudget = this.events.reduce((sum, event) => sum + (event.budget || 0), 0);

        // Update counts in sidebar
        const eventsCountElement = document.getElementById('events-count');
        const guestsCountElement = document.getElementById('guests-count');
        
        if (eventsCountElement) eventsCountElement.textContent = totalEvents;
        if (guestsCountElement) guestsCountElement.textContent = totalGuests;

        // Update dashboard stats
        const upcomingCountElement = document.getElementById('upcoming-count');
        const totalEventsElement = document.getElementById('total-events');
        const totalGuestsElement = document.getElementById('total-guests');
        const totalBudgetElement = document.getElementById('total-budget');

        if (upcomingCountElement) upcomingCountElement.textContent = upcomingEvents;
        if (totalEventsElement) totalEventsElement.textContent = totalEvents;
        if (totalGuestsElement) totalGuestsElement.textContent = totalGuests;
        if (totalBudgetElement) totalBudgetElement.textContent = `$${totalBudget.toLocaleString()}`;
    }

    updateDashboard() {
        const upcomingList = document.getElementById('upcoming-events-list');
        if (!upcomingList) return;

        const upcomingEvents = this.events
            .filter(event => new Date(event.date) >= new Date().setHours(0,0,0,0))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);

        if (upcomingEvents.length === 0) {
            upcomingList.innerHTML = '<div class="no-events"><i class="fas fa-calendar-plus"></i><p>No upcoming events</p></div>';
        } else {
            upcomingList.innerHTML = upcomingEvents.map(event => `
                <div class="event-item">
                    <h4>${event.name}</h4>
                    <div class="event-meta">
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(event.date)}</span>
                        <span><i class="fas fa-tag"></i> ${event.type}</span>
                        <span><i class="fas fa-users"></i> ${event.expectedGuests || 0} guests</span>
                    </div>
                    ${event.location ? `<div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>` : ''}
                </div>
            `).join('');
        }
    }

    renderEventsTable() {
        const tbody = document.getElementById('events-table-body');
        if (!tbody) return;
        
        if (this.events.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-events">
                        <i class="fas fa-calendar-plus"></i>
                        <p>No events yet. Create your first event!</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = this.events.map(event => `
                <tr>
                    <td><strong>${event.name}</strong></td>
                    <td>${this.formatDate(event.date)}</td>
                    <td><span class="event-type-tag">${event.type}</span></td>
                    <td>${event.expectedGuests || 0}</td>
                    <td>${event.location || '-'}</td>
                    <td>
                        <button class="action-btn delete" onclick="app.deleteEvent('${event.id}')" title="Delete Event">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    filterEvents(searchTerm) {
        const tbody = document.getElementById('events-table-body');
        if (!tbody) return;

        const filteredEvents = this.events.filter(event =>
            event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filteredEvents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-events">
                        <i class="fas fa-search"></i>
                        <p>No events found matching "${searchTerm}"</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = filteredEvents.map(event => `
                <tr>
                    <td><strong>${event.name}</strong></td>
                    <td>${this.formatDate(event.date)}</td>
                    <td><span class="event-type-tag">${event.type}</span></td>
                    <td>${event.expectedGuests || 0}</td>
                    <td>${event.location || '-'}</td>
                    <td>
                        <button class="action-btn delete" onclick="app.deleteEvent('${event.id}')" title="Delete Event">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    renderCalendar() {
        const calendarEl = document.getElementById('calendar');
        const monthYearEl = document.getElementById('current-month');
        
        if (!calendarEl || !monthYearEl) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        monthYearEl.textContent = this.currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let calendarHTML = `
            <div class="calendar-header">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div class="calendar-days">
        `;

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const hasEvent = this.events.some(event => 
                new Date(event.date).toDateString() === currentDate.toDateString()
            );

            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = currentDate.toDateString() === new Date().toDateString();

            calendarHTML += `
                <div class="calendar-day ${hasEvent ? 'has-event' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}"
                     onclick="app.handleDateClick('${currentDate.toISOString()}')">
                    <div class="date-number">${currentDate.getDate()}</div>
                    ${hasEvent ? '<div class="event-dot"></div>' : ''}
                </div>
            `;
        }

        calendarHTML += '</div>';
        calendarEl.innerHTML = calendarHTML;
    }

    handleDateClick(dateString) {
        const date = new Date(dateString);
        const eventsOnDate = this.events.filter(event => 
            new Date(event.date).toDateString() === date.toDateString()
        );
        
        if (eventsOnDate.length > 0) {
            const eventList = eventsOnDate.map(event => 
                `• ${event.name} (${event.type}) - ${event.expectedGuests || 0} guests`
            ).join('\n');
            alert(`Events on ${this.formatDate(dateString)}:\n${eventList}`);
        } else {
            this.showEventModal();
            document.getElementById('event-date').value = date.toISOString().split('T')[0];
        }
    }

    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(event => event.id !== eventId);
            this.saveToLocalStorage();
            this.updateUI();
            this.showCelebration('Event deleted!');
        }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    updateDateDisplay() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
}

// Add celebration styles
const celebrationStyles = `
@keyframes celebrationPop {
    0% { 
        transform: translate(-50%, -50%) scale(0); 
        opacity: 0;
    }
    70% { 
        transform: translate(-50%, -50%) scale(1.1); 
        opacity: 1;
    }
    100% { 
        transform: translate(-50%, -50%) scale(1); 
        opacity: 1;
    }
}

.no-events {
    text-align: center;
    padding: 40px;
    color: #666;
    font-style: italic;
}

.no-events i {
    font-size: 48px;
    margin-bottom: 10px;
    opacity: 0.5;
    display: block;
}

.no-events p {
    margin: 0;
    font-size: 16px;
}

.event-type-tag {
    background: #e3f2fd;
    color: #1976d2;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
}

.calendar-day {
    position: relative;
    min-height: 80px;
    padding: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
}

.calendar-day:hover {
    background: rgba(39, 174, 96, 0.1);
    transform: scale(1.05);
}

.calendar-day.today {
    background: rgba(52, 152, 219, 0.2);
    border: 2px solid #3498db;
}

.calendar-day.has-event {
    background: rgba(39, 174, 96, 0.15);
    border: 1px solid rgba(39, 174, 96, 0.3);
}

.calendar-day.other-month {
    color: #ccc;
    background: rgba(0, 0, 0, 0.05);
}

.date-number {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
}

.event-dot {
    width: 8px;
    height: 8px;
    background: #27ae60;
    border-radius: 50%;
    margin-top: 2px;
}

.calendar-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-weight: bold;
    margin-bottom: 10px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 5px;
    transition: all 0.3s ease;
    color: #666;
}

.action-btn:hover {
    background: #f8f9fa;
    color: #e74c3c;
    transform: scale(1.1);
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-box i {
    position: absolute;
    left: 12px;
    color: var(--text-light);
    z-index: 1;
}

.search-box input {
    padding: 10px 10px 10px 35px;
    border: 1px solid var(--border-color);
    border-radius: 25px;
    width: 250px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
}

.calendar-controls {
    display: flex;
    align-items: center;
    gap: 15px;
}

.calendar-controls button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--secondary-color);
    transition: all 0.3s ease;
}

.calendar-controls button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = celebrationStyles;
document.head.appendChild(styleSheet);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new EventPlannerApp();
});