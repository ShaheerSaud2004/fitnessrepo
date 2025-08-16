// Scheduling Module
class SchedulingModule {
    constructor() {
        this.scheduledEvents = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadScheduledEvents();
        this.updateScheduledEvents();
    }

    setupEventListeners() {
        // Schedule form
        const scheduleForm = document.getElementById('schedule-form');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.scheduleEvent();
            });
        }

        // Set default date to today
        const dateInput = document.getElementById('event-date');
        if (dateInput) {
            dateInput.value = window.fitnessApp.getToday();
        }
    }

    loadScheduledEvents() {
        this.scheduledEvents = window.fitnessApp.getData('scheduledEvents') || [];
    }

    scheduleEvent() {
        try {
            const title = document.getElementById('event-title').value.trim();
            const date = document.getElementById('event-date').value;
            const time = document.getElementById('event-time').value;
            const type = document.getElementById('event-type').value;
            const notes = document.getElementById('event-notes').value.trim();

            // Validate inputs
            if (!title || !date || !time || !type) {
                throw new Error('Please fill in all required fields');
            }

            // Validate date (not in the past)
            const eventDateTime = new Date(`${date}T${time}`);
            const now = new Date();
            if (eventDateTime < now) {
                throw new Error('Event cannot be scheduled in the past');
            }

            // Create event
            const event = {
                id: this.generateEventId(),
                title: title,
                date: date,
                time: time,
                type: type,
                notes: notes,
                createdAt: new Date().toISOString()
            };

            // Add to scheduled events
            this.scheduledEvents.push(event);
            window.fitnessApp.saveData('scheduledEvents', this.scheduledEvents);

            // Update display
            this.updateScheduledEvents();

            // Clear form
            document.getElementById('schedule-form').reset();
            document.getElementById('event-date').value = window.fitnessApp.getToday();

            // Show success message
            window.fitnessApp.showNotification('Event scheduled successfully!', 'success');

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    updateScheduledEvents() {
        const container = document.getElementById('scheduled-events');
        if (!container) return;

        if (this.scheduledEvents.length === 0) {
            container.innerHTML = '<p class="empty-state">No events scheduled</p>';
            return;
        }

        // Sort by date and time (earliest first)
        const sortedEvents = this.scheduledEvents
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

        const eventsHTML = sortedEvents.map(event => {
            const eventDateTime = new Date(`${event.date}T${event.time}`);
            const now = new Date();
            const isPast = eventDateTime < now;
            const isToday = event.date === window.fitnessApp.getToday();

            return `
                <div class="event-item ${isPast ? 'past-event' : ''}">
                    <div class="event-header">
                        <div class="event-title">${event.title}</div>
                        <div class="event-type">${this.getEventTypeLabel(event.type)}</div>
                    </div>
                    <div class="event-datetime">
                        ${isToday ? 'Today' : window.fitnessApp.formatDate(event.date)} at ${window.fitnessApp.formatTime(eventDateTime)}
                        ${isPast ? ' <span class="past-indicator">(Past)</span>' : ''}
                    </div>
                    ${event.notes ? `<div class="event-notes">${event.notes}</div>` : ''}
                    <div class="event-actions">
                        <button class="btn-secondary btn-sm" onclick="schedulingModule.editEvent('${event.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-danger btn-sm" onclick="schedulingModule.deleteEvent('${event.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = eventsHTML;
    }

    getEventTypeLabel(type) {
        const typeLabels = {
            'workout': 'Workout',
            'cardio': 'Cardio',
            'stretching': 'Stretching',
            'rehab': 'Rehabilitation',
            'other': 'Other'
        };
        return typeLabels[type] || type;
    }

    editEvent(eventId) {
        const event = this.scheduledEvents.find(e => e.id === eventId);
        if (!event) {
            window.fitnessApp.showNotification('Event not found', 'error');
            return;
        }

        // Populate form with event data
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-date').value = event.date;
        document.getElementById('event-time').value = event.time;
        document.getElementById('event-type').value = event.type;
        document.getElementById('event-notes').value = event.notes || '';

        // Remove the old event
        this.deleteEvent(eventId, false); // Don't show notification

        // Scroll to form
        document.getElementById('schedule-form').scrollIntoView({ behavior: 'smooth' });

        window.fitnessApp.showNotification('Event loaded for editing', 'info');
    }

    deleteEvent(eventId, showNotification = true) {
        const eventIndex = this.scheduledEvents.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            if (showNotification) {
                window.fitnessApp.showNotification('Event not found', 'error');
            }
            return;
        }

        const event = this.scheduledEvents[eventIndex];
        this.scheduledEvents.splice(eventIndex, 1);
        window.fitnessApp.saveData('scheduledEvents', this.scheduledEvents);

        this.updateScheduledEvents();

        if (showNotification) {
            window.fitnessApp.showNotification('Event deleted successfully', 'success');
        }
    }

    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get scheduled events statistics
    getScheduledEventsStats() {
        if (this.scheduledEvents.length === 0) {
            return {
                totalEvents: 0,
                upcomingEvents: 0,
                pastEvents: 0,
                eventsByType: {},
                nextEvent: null
            };
        }

        const now = new Date();
        const upcomingEvents = this.scheduledEvents.filter(event => {
            const eventDateTime = new Date(`${event.date}T${event.time}`);
            return eventDateTime > now;
        });

        const pastEvents = this.scheduledEvents.filter(event => {
            const eventDateTime = new Date(`${event.date}T${event.time}`);
            return eventDateTime <= now;
        });

        // Count events by type
        const eventsByType = {};
        this.scheduledEvents.forEach(event => {
            eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
        });

        // Find next event
        const nextEvent = upcomingEvents.length > 0 
            ? upcomingEvents.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0]
            : null;

        return {
            totalEvents: this.scheduledEvents.length,
            upcomingEvents: upcomingEvents.length,
            pastEvents: pastEvents.length,
            eventsByType,
            nextEvent
        };
    }

    // Get today's events
    getTodayEvents() {
        const today = window.fitnessApp.getToday();
        return this.scheduledEvents.filter(event => event.date === today);
    }

    // Get upcoming events (next 7 days)
    getUpcomingEvents(days = 7) {
        const today = new Date();
        const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

        return this.scheduledEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= futureDate;
        }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    }

    // Get events by type
    getEventsByType(type) {
        return this.scheduledEvents.filter(event => event.type === type);
    }

    // Check for conflicts
    checkForConflicts(newEvent) {
        const newEventDateTime = new Date(`${newEvent.date}T${newEvent.time}`);
        const oneHourLater = new Date(newEventDateTime.getTime() + 60 * 60 * 1000);

        return this.scheduledEvents.filter(event => {
            if (event.id === newEvent.id) return false; // Skip self when editing

            const eventDateTime = new Date(`${event.date}T${event.time}`);
            const eventEndTime = new Date(eventDateTime.getTime() + 60 * 60 * 1000); // Assume 1 hour duration

            // Check for overlap
            return (newEventDateTime < eventEndTime && oneHourLater > eventDateTime);
        });
    }

    // Get scheduling insights
    getSchedulingInsights() {
        const stats = this.getScheduledEventsStats();
        const insights = [];

        if (stats.totalEvents === 0) {
            insights.push('No events scheduled yet. Start by scheduling your first workout!');
        } else {
            if (stats.upcomingEvents === 0) {
                insights.push('No upcoming events scheduled. Consider planning your next workout session.');
            } else {
                insights.push(`You have ${stats.upcomingEvents} upcoming event(s) scheduled.`);
            }

            if (stats.pastEvents > 0) {
                insights.push(`You've completed ${stats.pastEvents} scheduled event(s).`);
            }

            // Most common event type
            const mostCommonType = Object.keys(stats.eventsByType).reduce((a, b) => 
                stats.eventsByType[a] > stats.eventsByType[b] ? a : b
            );
            insights.push(`Your most scheduled activity type is: ${this.getEventTypeLabel(mostCommonType)}`);
        }

        return insights;
    }

    // Get scheduling recommendations
    getSchedulingRecommendations() {
        const profile = window.profileModule.getProfile();
        const stats = this.getScheduledEventsStats();
        const recommendations = [];

        if (!profile) {
            recommendations.push('Complete your profile to get personalized scheduling recommendations.');
            return recommendations;
        }

        // Based on fitness goal
        switch (profile.goal) {
            case 'build-muscle':
                recommendations.push('Schedule 3-4 strength training sessions per week');
                recommendations.push('Allow 48-72 hours between muscle groups');
                recommendations.push('Include rest days for muscle recovery');
                break;
            case 'lose-fat':
                recommendations.push('Schedule 4-5 cardio sessions per week');
                recommendations.push('Include 2-3 strength training sessions');
                recommendations.push('Mix high-intensity and moderate-intensity cardio');
                break;
            case 'improve-endurance':
                recommendations.push('Schedule 3-4 cardio sessions per week');
                recommendations.push('Include 1-2 strength training sessions');
                recommendations.push('Gradually increase duration and intensity');
                break;
        }

        // Based on experience level
        switch (profile.experience) {
            case 'beginner':
                recommendations.push('Start with 2-3 sessions per week');
                recommendations.push('Focus on learning proper form');
                recommendations.push('Allow plenty of recovery time');
                break;
            case 'intermediate':
                recommendations.push('Aim for 4-5 sessions per week');
                recommendations.push('Include variety in your training');
                recommendations.push('Plan deload weeks every 4-6 weeks');
                break;
            case 'advanced':
                recommendations.push('You can handle 5-6 sessions per week');
                recommendations.push('Consider periodization in your training');
                recommendations.push('Monitor recovery and adjust as needed');
                break;
        }

        // Based on current schedule
        if (stats.upcomingEvents < 2) {
            recommendations.push('Consider scheduling more events to maintain consistency');
        } else if (stats.upcomingEvents > 7) {
            recommendations.push('You have many events scheduled. Ensure you\'re allowing adequate recovery time.');
        }

        return recommendations;
    }

    // Export scheduled events data
    exportScheduledEventsData() {
        const exportData = {
            scheduledEvents: this.scheduledEvents,
            stats: this.getScheduledEventsStats(),
            insights: this.getSchedulingInsights(),
            recommendations: this.getSchedulingRecommendations(),
            exportDate: new Date().toISOString()
        };

        return JSON.stringify(exportData, null, 2);
    }

    // Import scheduled events data
    importScheduledEventsData(data) {
        try {
            const importData = JSON.parse(data);
            
            if (!importData.scheduledEvents) {
                throw new Error('Invalid scheduled events data format');
            }

            this.scheduledEvents = importData.scheduledEvents;

            // Save data
            window.fitnessApp.saveData('scheduledEvents', this.scheduledEvents);

            // Update display
            this.updateScheduledEvents();

            window.fitnessApp.showNotification('Scheduled events imported successfully!', 'success');

        } catch (error) {
            throw new Error(`Failed to import scheduled events data: ${error.message}`);
        }
    }

    // Clear past events
    clearPastEvents() {
        const now = new Date();
        const originalCount = this.scheduledEvents.length;
        
        this.scheduledEvents = this.scheduledEvents.filter(event => {
            const eventDateTime = new Date(`${event.date}T${event.time}`);
            return eventDateTime > now;
        });

        const removedCount = originalCount - this.scheduledEvents.length;
        
        if (removedCount > 0) {
            window.fitnessApp.saveData('scheduledEvents', this.scheduledEvents);
            this.updateScheduledEvents();
            window.fitnessApp.showNotification(`Cleared ${removedCount} past event(s)`, 'success');
        } else {
            window.fitnessApp.showNotification('No past events to clear', 'info');
        }
    }
}

// Initialize scheduling module
document.addEventListener('DOMContentLoaded', () => {
    window.schedulingModule = new SchedulingModule();
});

// Export for use in other modules
window.SchedulingModule = SchedulingModule;
