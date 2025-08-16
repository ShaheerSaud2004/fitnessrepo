// Charts Module
class ChartsModule {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        // Initialize charts when DOM is ready
        this.setupChartDefaults();
    }

    setupChartDefaults() {
        // Set Chart.js defaults
        Chart.defaults.font.family = "'Poppins', sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#666';
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
        Chart.defaults.plugins.tooltip.bodyColor = '#ffffff';
        Chart.defaults.plugins.tooltip.borderColor = '#667eea';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.displayColors = false;
    }

    // Create progress chart for dashboard
    createProgressChart(ctx, data) {
        // Destroy existing chart if it exists
        if (this.charts.progress) {
            this.charts.progress.destroy();
            this.charts.progress = null;
        }

        // Check if canvas is already in use
        if (ctx.chart) {
            ctx.chart.destroy();
            ctx.chart = null;
        }

        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Workout Volume (kg)',
                    data: data.volumes,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: 7
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return value + ' kg';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#667eea'
                    }
                }
            }
        });

        return this.charts.progress;
    }

    // Create macro chart for nutrition
    createMacroChart(ctx, data) {
        // Destroy existing chart if it exists
        if (this.charts.macro) {
            this.charts.macro.destroy();
            this.charts.macro = null;
        }

        // Check if canvas is already in use
        if (ctx.chart) {
            ctx.chart.destroy();
            ctx.chart = null;
        }

        this.charts.macro = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbs', 'Fat'],
                datasets: [{
                    data: [data.protein, data.carbs, data.fat],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb'
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value}g (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });

        return this.charts.macro;
    }

    // Create hydration chart
    createHydrationChart(ctx, current, target) {
        // Destroy existing chart if it exists
        if (this.charts.hydration) {
            this.charts.hydration.destroy();
            this.charts.hydration = null;
        }

        // Check if canvas is already in use
        if (ctx.chart) {
            ctx.chart.destroy();
            ctx.chart = null;
        }

        const percentage = Math.min((current / target) * 100, 100);
        const remaining = Math.max(0, 100 - percentage);

        // Determine color based on percentage
        let color = '#667eea';
        if (percentage >= 100) {
            color = '#28a745';
        } else if (percentage >= 75) {
            color = '#667eea';
        } else if (percentage >= 50) {
            color = '#ffc107';
        } else {
            color = '#dc3545';
        }

        this.charts.hydration = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Hydrated', 'Remaining'],
                datasets: [{
                    data: [percentage, remaining],
                    backgroundColor: [color, '#e1e5e9'],
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                if (label === 'Hydrated') {
                                    return `${label}: ${value.toFixed(1)}%`;
                                }
                                return `${label}: ${value.toFixed(1)}%`;
                            }
                        }
                    }
                },
                cutout: '75%',
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });

        return this.charts.hydration;
    }

    // Create energy level chart
    createEnergyChart(ctx, data) {
        // Destroy existing chart if it exists
        if (this.charts.energy) {
            this.charts.energy.destroy();
            this.charts.energy = null;
        }

        // Check if canvas is already in use
        if (ctx.chart) {
            ctx.chart.destroy();
            ctx.chart = null;
        }

        this.charts.energy = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Energy Level',
                    data: data.levels,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#28a745',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 10,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            stepSize: 2
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        return this.charts.energy;
    }

    // Create habit progress chart
    createHabitProgressChart(ctx, data) {
        if (this.charts.habitProgress) {
            this.charts.habitProgress.destroy();
        }

        this.charts.habitProgress = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Completion Rate (%)',
                    data: data.rates,
                    backgroundColor: data.rates.map(rate => 
                        rate >= 80 ? '#28a745' : 
                        rate >= 60 ? '#667eea' : 
                        rate >= 40 ? '#ffc107' : '#dc3545'
                    ),
                    borderWidth: 0,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        return this.charts.habitProgress;
    }

    // Create weekly activity chart
    createWeeklyActivityChart(ctx, data) {
        if (this.charts.weeklyActivity) {
            this.charts.weeklyActivity.destroy();
        }

        this.charts.weeklyActivity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Workouts',
                        data: data.workouts,
                        backgroundColor: '#667eea',
                        borderWidth: 0,
                        borderRadius: 4
                    },
                    {
                        label: 'Nutrition Entries',
                        data: data.nutrition,
                        backgroundColor: '#764ba2',
                        borderWidth: 0,
                        borderRadius: 4
                    },
                    {
                        label: 'Hydration Entries',
                        data: data.hydration,
                        backgroundColor: '#f093fb',
                        borderWidth: 0,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        }
                    }
                }
            }
        });

        return this.charts.weeklyActivity;
    }

    // Create goal progress chart
    createGoalProgressChart(ctx, data) {
        if (this.charts.goalProgress) {
            this.charts.goalProgress.destroy();
        }

        this.charts.goalProgress = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Current Progress',
                    data: data.current,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }, {
                    label: 'Target',
                    data: data.target,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#28a745',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        return this.charts.goalProgress;
    }

    // Update chart data
    updateChart(chartName, newData) {
        if (this.charts[chartName]) {
            const chart = this.charts[chartName];
            
            if (newData.labels) {
                chart.data.labels = newData.labels;
            }
            
            if (newData.datasets) {
                chart.data.datasets = newData.datasets;
            } else if (newData.data) {
                chart.data.datasets[0].data = newData.data;
            }
            
            chart.update();
        }
    }

    // Destroy a specific chart
    destroyChart(chartName) {
        if (this.charts[chartName]) {
            this.charts[chartName].destroy();
            delete this.charts[chartName];
        }
    }

    // Destroy all charts
    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartName => {
            this.destroyChart(chartName);
        });
    }

    // Get chart instance
    getChart(chartName) {
        return this.charts[chartName];
    }

    // Apply dark mode to charts
    applyDarkMode(isDark) {
        const textColor = isDark ? '#e1e5e9' : '#666';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        Object.values(this.charts).forEach(chart => {
            if (chart.options.scales) {
                // Update x-axis
                if (chart.options.scales.x) {
                    chart.options.scales.x.grid.color = gridColor;
                    chart.options.scales.x.ticks.color = textColor;
                }
                
                // Update y-axis
                if (chart.options.scales.y) {
                    chart.options.scales.y.grid.color = gridColor;
                    chart.options.scales.y.ticks.color = textColor;
                }
                
                // Update r-axis (for radar charts)
                if (chart.options.scales.r) {
                    chart.options.scales.r.grid.color = gridColor;
                    chart.options.scales.r.ticks.color = textColor;
                }
            }
            
            // Update legend
            if (chart.options.plugins.legend) {
                chart.options.plugins.legend.labels.color = textColor;
            }
            
            chart.update();
        });
    }

    // Create chart with custom options
    createCustomChart(ctx, type, data, options = {}) {
        const chartId = 'custom_' + Date.now();
        
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        };

        const mergedOptions = this.mergeOptions(defaultOptions, options);

        this.charts[chartId] = new Chart(ctx, {
            type: type,
            data: data,
            options: mergedOptions
        });

        return this.charts[chartId];
    }

    // Merge options helper
    mergeOptions(defaultOptions, customOptions) {
        const merged = { ...defaultOptions };
        
        for (const key in customOptions) {
            if (typeof customOptions[key] === 'object' && customOptions[key] !== null) {
                merged[key] = this.mergeOptions(merged[key] || {}, customOptions[key]);
            } else {
                merged[key] = customOptions[key];
            }
        }
        
        return merged;
    }

    // Export chart as image
    exportChartAsImage(chartName, format = 'png') {
        const chart = this.charts[chartName];
        if (!chart) {
            throw new Error('Chart not found');
        }

        const canvas = chart.canvas;
        const link = document.createElement('a');
        link.download = `${chartName}-${new Date().toISOString().split('T')[0]}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
    }

    // Get chart data as JSON
    exportChartData(chartName) {
        const chart = this.charts[chartName];
        if (!chart) {
            throw new Error('Chart not found');
        }

        return {
            labels: chart.data.labels,
            datasets: chart.data.datasets,
            options: chart.options
        };
    }
}

// Initialize charts module
document.addEventListener('DOMContentLoaded', () => {
    window.chartsModule = new ChartsModule();
});

// Export for use in other modules
window.ChartsModule = ChartsModule;
