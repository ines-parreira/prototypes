import {fromJS} from 'immutable'
import moment from 'moment'
import _merge from 'lodash/merge'
import {formatDuration} from '../pages/stats/common/utils'
import {defaults} from 'react-chartjs-2'

export const colors = [
    '#06cd96',
    '#e88850',
    '#466fde',
    '#ca77b7',
    '#e0495e',
    '#8086d8',
    // 30% darker
    '#06af78',
    '#ca6a50',
    '#455fc0',
    '#ac5999',
    '#c2495e',
    '#6a70ba',
    // 60% darker
    '#069172',
    '#ac7031',
    '#2a62a2',
    '#8e4a7b',
    '#a42c38',
    '#5e639c',
]

export const chartMaxHeight = 400

// Default configuration for Chart.js
_merge(defaults, {
    global: {
        maintainAspectRatio: false,
        layout: {
            padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            }
        },
        title: {
            position: 'top',
            fontSize: 16,
            fontStyle: '600',
            fontColor: 'rgb(41, 43, 44)',
            fontFamily: '\'Source Sans Pro\', \'Helvetica Neue\', Arial, Helvetica, sans-serif',
        },
        legend: {
            labels: {
                usePointStyle: true,
                fontSize: 13.5,
                fontStyle: '600',
                fontColor: 'rgb(97, 97, 97)',
                fontFamily: '\'Source Sans Pro\', \'Helvetica Neue\', Arial, Helvetica, sans-serif',
            }
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            titleFontSize: 15,
            bodyFontSize: 14,
            titleMarginBottom: 15,
            bodySpacing: 7,
            xPadding: 15,
            yPadding: 15,
        },
        hover: {
            mode: 'index',
            intersect: false,
        },
        animation: {
            duration: 300
        },
        elements: {
            point: {
                radius: 0
            }
        }
    }
})

const defaultTicks = {
    fontColor: 'rgba(0, 0, 0, 0.4)'
}

const defaultScaleLabel = {
    fontColor: 'rgba(0, 0, 0, 0.4)'
}

const defaultGridLines = {
    borderDash: [3, 6]
}
// configuration for every stats
export const config = fromJS({
    tickets_created_per_channel: {
        style: 'table',
        options: () => ({
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0,
                        suggestedMax: 1,
                    }
                }]
            }
        })
    },
    tickets_created_per_channel_per_day: {
        style: 'bar',
        lines: {
            facebook: {
                label: 'Facebook',
                color: '#466fde',
            },
            'facebook-messenger': {
                label: 'Facebook Messenger',
                color: '#0084ff',
            },
            twitter: {
                label: 'Twitter',
                color: '#4099FF'
            },
            chat: {
                label: 'Chat',
                color: '#ca77b7'
            },
            email: {
                label: 'Email',
                color: '#e0495e'
            },
            api: {
                label: 'Gorgias API',
                color: '#e88850'
            },
            aircall: {
                label: 'Aircall',
                color: '#06cd96'
            },
            phone: {
                label: 'Phone',
                color: '#ffe03f'
            },
            sms: {
                label: 'Sms',
                color: '#69c473'
            }
        },
        options: (legend) => ({
            title: {
                display: true,
                text: 'Tickets created per channel'
            },
            scales: {
                xAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: true,
                    gridLines: {
                        display: false
                    },
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb
                    })
                }],
                yAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    stacked: true,
                    ticks: _merge({}, defaultTicks, {
                        min: 0,
                        suggestedMax: 1,
                    }),
                    gridLines: defaultGridLines
                }]
            }
        })
    },
    tickets_closed_per_agent: {
        style: 'table',
        options: () => ({
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0,
                        suggestedMax: 1,
                    }
                }]
            }
        })
    },
    tickets_per_tag: {
        style: 'table',
        options: () => ({
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0,
                        suggestedMax: 1,
                    }
                }]
            }
        })
    },
    tickets_closed_per_agent_per_day: {
        style: 'bar',
        options: (legend) => ({
            title: {
                display: true,
                text: 'Tickets closed per agent'
            },
            scales: {
                xAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: true,
                    gridLines: {
                        display: false
                    },
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb
                    })
                }],
                yAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    ticks: _merge({}, defaultTicks, {
                        min: 0,
                        suggestedMax: 1,
                        callback: formatTicketAxeCb
                    }),
                    gridLines: defaultGridLines,
                    stacked: true,
                }]
            }
        })
    },
    tickets_per_status_per_day: {
        style: 'bar',
        lines: {
            created: {
                label: 'Ticket created',
                color: '#ff9b53',
            },
            closed: {
                label: 'Ticket closed',
                color: '#06cd96'
            }
        },
        options: (legend) => ({
            title: {
                display: true,
                text: 'Support volume'
            },
            scales: {
                xAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: false,
                    gridLines: {
                        display: false,
                    },
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb
                    })
                }],
                yAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    ticks: _merge({}, defaultTicks, {
                        min: 0,
                        suggestedMax: 1,
                        fontColor: 'rgba(0, 0, 0, 0.5)',
                        callback: formatTicketAxeCb
                    }),
                    gridLines: defaultGridLines
                }]
            }
        })
    },
    overview: {
        style: 'key-metrics',
        metrics: {
            total_new_tickets: {
                label: 'New tickets',
                tooltip: 'Tickets created during this period',
            },
            total_closed_tickets: {
                label: 'Closed tickets',
                tooltip: 'Tickets closed during this period. If a ticket was closed multiple times, ' +
                'we only take into account the last time it was closed',
            },
            total_ticket_messages_sent: {
                tooltip: 'Total number of messages on all channels sent by agents',
                label: 'Messages sent',
            },
            total_ticket_messages_received: {
                tooltip: 'Total number of messages on all channels received from user',
                label: 'Messages received',
            },
            median_first_response_time: {
                tooltip: 'Difference between the date when the first message was received from ' +
                'the user and the first response of the agent. Only tickets with at least 1 response ' +
                'are taken into account. This doesn\'t take into account responses sent by the rules (median)',
                label: 'First response time',
                moreIsBetter: false,
                type: 'duration'
            },
            median_resolution_time: {
                name: 'median_resolution_time',
                tooltip: 'Difference between the date the ticket was created and when it was closed (median). ' +
                'Only tickets with at least 1 response are taken into account',
                label: 'Resolution time',
                moreIsBetter: false,
                type: 'duration'
            },
            total_one_touch_tickets: {
                tooltip: 'Percentage of tickets that were solved with only one response from your agents',
                label: 'One-touch tickets',
                moreIsBetter: true,
                type: 'percent'
            },
        }

    },
    resolution_time_per_day: {
        style: 'line',
        lines: {
            '50%': {
                label: 'median',
                color: '#466fde',
            },
            '90%': {
                label: '95%',
                color: '#ca77b7'
            }
        },
        options: (legend) => ({
            title: {
                display: true,
                text: 'Resolution time (percentiles)'
            },
            tooltips: {
                callbacks: {
                    label: formatDurationTooltipCb
                }
            },
            scales: {
                xAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    gridLines: {
                        display: false
                    },
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb
                    })
                }],
                yAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    gridLines: defaultGridLines,
                    ticks: _merge({}, defaultTicks, {
                        min: 0,
                        suggestedMax: 1,
                        callback: formatDurationAxeCb
                    }),
                }]
            }
        })
    },
    first_response_time_per_day: {
        style: 'line',
        lines: {
            '50%': {
                label: 'median',
                color: '#466fde',
            },
            '90%': {
                label: '95%',
                color: '#ca77b7'
            }
        },
        options: (legend) => ({
            title: {
                display: true,
                text: 'First response time (percentiles)'
            },
            tooltips: {
                callbacks: {
                    label: formatDurationTooltipCb
                }
            },
            scales: {
                xAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    gridLines: {
                        display: false
                    },
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb
                    })
                }],
                yAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    gridLines: defaultGridLines,
                    ticks: _merge({}, defaultTicks, {
                        min: 0,
                        suggestedMax: 1,
                        callback: formatDurationAxeCb
                    })
                }]
            }
        })
    },

})

// Callbacks to format values of datasets or axes
const formatDurationAxeCb = (val) => {
    const duration = moment.duration(val, 'seconds')
    const days = duration.days()
    if (days) {
        return `${days}d `
    }

    const hours = duration.hours()
    if (hours) {
        return `${hours}h `
    }

    const minutes = duration.minutes()
    if (minutes) {
        return `${minutes}m `
    }

    const seconds = duration.seconds()
    if (seconds) {
        return `${seconds}s`
    }
}

const formatDateAxeCb = (val) => {
    return moment.unix(val).format('MMM Do')
}

// hide number of tickets if it's not an int
const formatTicketAxeCb = (val) => {
    return val % 1 === 0 ? val : ''
}

const formatDurationTooltipCb = (item, data) => {
    return `${data.datasets[item.datasetIndex].label}: ${formatDuration(item.yLabel)}`
}
