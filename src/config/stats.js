import React from 'react'
import {fromJS} from 'immutable'
import moment from 'moment'
import _merge from 'lodash/merge'
import _isString from 'lodash/isString'
import {formatDuration} from '../pages/stats/common/utils'
import {defaults} from 'react-chartjs-2'
import {TagLabel} from '../pages/common/utils/labels'

// Available Stats. These names should match names in `g/stats/config`
export const OVERVIEW = 'overview'
export const SUPPORT_VOLUME = 'support-volume'
export const RESOLUTION_TIME = 'resolution-time'
export const FIRST_RESPONSE_TIME = 'first-response-time'
export const TICKETS_PER_TAG = 'tickets-per-tag'
export const TICKETS_CREATED_PER_CHANNEL = 'tickets-created-per-channel'
export const TICKETS_CREATED_PER_CHANNEL_PER_DAY = 'tickets-created-per-channel-per-day'
export const TICKETS_CLOSED_PER_AGENT = 'tickets-closed-per-agent'
export const TICKETS_CLOSED_PER_AGENT_PER_DAY = 'tickets-closed-per-agent-per-day'
export const MESSAGES_SENT_PER_MACRO = 'messages-sent-per-macro'

const mainBlue = '#152065'
export const colors = [
    '#abd1e9',
    '#ffa8d9',
    '#fec18c',
    '#dfee90',
    '#9ce0e0',
    '#2292c7',
    '#bc0017',
    '#ff7d5a',
    '#ff5cd6',
    '#814db0',
    '#1d3ba1',
    '#8fce6e',
    '#890095',
    '#40048d',
    '#35d0d3',
    '#d700bf',
    '#f72321',
    '#007306',
    '#8398cb',
    '#24ae23',
]

export const chartMaxHeight = 360
export const chartPointRadius = 4

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
            fontFamily: '\'Inter UI\', \'Helvetica Neue\', Arial, Helvetica, sans-serif',
        },
        legend: {
            // legend is displayed separately
            display: false,
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            titleFontSize: 15,
            titleFontColor: mainBlue,
            bodyFontSize: 14,
            bodyFontColor: mainBlue,
            titleMarginBottom: 15,
            bodySpacing: 10,
            xPadding: 20,
            yPadding: 20,
            caretPadding: 5,
            backgroundColor: '#ffffff',
            borderColor: '#e2e3ec',
            borderWidth: 1
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
    fontColor: '#b2bddd'
}

const defaultScaleLabel = {
    fontColor: '#b2bddd'
}
const defaultXAxeGridLines = {
    display: false,
    drawBorder: false,
    color: '#dfe3f1',
}
const defaultYAxeGridLines = {
    drawBorder: false,
    color: '#dfe3f1',
    borderDash: [2, 4]
}
// configuration for each stat
export const stats = fromJS({
    [MESSAGES_SENT_PER_MACRO]: {
        helpText: 'Number of messages sent by an agent or a rule per macro',
        style: 'table',
        downloadable: true,
        callbacks: {
            cell: (line, val) => {
                if (_isString(val) && val.toLowerCase() === 'without macro') {
                    return (<i><b>{val}</b></i>)
                }

                return val
            }
        }
    },
    [TICKETS_CREATED_PER_CHANNEL]: {
        helpText: 'Number of tickets created per channel',
        style: 'table',
        downloadable: true
    },
    [TICKETS_CREATED_PER_CHANNEL_PER_DAY]: {
        helpText: 'Number of tickets created per channel per day',
        style: 'bar',
        downloadable: true,
        lines: {
            facebook: {
                label: 'Facebook',
                color: '#4872db',
            },
            'facebook-messenger': {
                label: 'Facebook Messenger',
                color: '#1787fb',
            },
            twitter: {
                label: 'Twitter',
                color: '#00aced'
            },
            chat: {
                label: 'Chat',
                color: '#ffb584'
            },
            email: {
                label: 'Email',
                color: '#ff5eab'
            },
            api: {
                label: 'Gorgias API',
                color: '#e88850'
            },
            aircall: {
                label: 'Aircall',
                color: '#34ba28'
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
            scales: {
                xAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: true,
                    gridLines: {
                        drawBorder: false,
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
                    gridLines: defaultYAxeGridLines
                }]
            }
        })
    },
    [TICKETS_CLOSED_PER_AGENT]: {
        helpText: 'Number of tickets closed per agent. Only tickets where an agent is assigned are taken into account.',
        style: 'table',
        downloadable: true,
        callbacks: {
            cell: (line, val) => {
                if (_isString(val) && val.toLowerCase() === 'unassigned') {
                    return (<i><b>{val}</b></i>)
                }

                return val
            }
        }
    },
    [TICKETS_PER_TAG]: {
        helpText: 'Number of tickets created per tag',
        style: 'table',
        downloadable: true,
        callbacks: {
            cell: (line, val, {tagColors}) => {
                const tagName = line.first()

                // current cell does not contain a tag name
                if (tagName !== val) {
                    return val
                }

                if (tagName.toLowerCase() === 'untagged') {
                    return (<i><b>{val}</b></i>)
                }

                if (!tagColors) {
                    return val
                }
                return (
                    <TagLabel decoration={tagColors.get(tagName)}>
                        {tagName}
                    </TagLabel>
                )
            }
        }
    },
    [TICKETS_CLOSED_PER_AGENT_PER_DAY]: {
        helpText: `Number of tickets closed per agent per day. 
                   Only tickets where an agent is assigned are taken into account.`,
        style: 'bar',
        downloadable: true,
        options: (legend) => ({
            scales: {
                xAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: true,
                    gridLines: defaultXAxeGridLines,
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
                    gridLines: defaultYAxeGridLines,
                    stacked: true,
                }]
            }
        })
    },
    [SUPPORT_VOLUME]: {
        helpText: 'Number of tickets created, replied by agents and closed.',
        style: 'bar',
        downloadable: true,
        lines: {
            created: {
                label: 'Ticket created',
                color: '#ffb584',
            },
            replied: {
                label: 'Ticket replied',
                color: '#8892f2'
            },
            closed: {
                label: 'Ticket closed',
                color: '#a5e5ab'
            }
        },
        options: (legend) => ({
            scales: {
                xAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: false,
                    gridLines: defaultXAxeGridLines,
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
                    gridLines: defaultYAxeGridLines
                }]
            }
        })
    },
    [OVERVIEW]: {
        style: 'key-metrics',
        metrics: {
            total_new_tickets: {
                label: 'Tickets created',
                tooltip: 'Number of tickets created.',
            },
            total_replied_tickets: {
                label: 'Tickets replied',
                tooltip: 'Number of tickets replied by agents.',
            },
            total_closed_tickets: {
                label: 'Tickets closed',
                tooltip: 'Number of tickets closed. If a ticket was closed multiple times, ' +
                'we only take into account the last time it was closed.',
            },
            total_messages_sent: {
                tooltip: 'Number of messages on all channels sent by agents.',
                label: 'Messages sent',
            },
            total_messages_received: {
                tooltip: 'Number of messages on all channels received from user.',
                label: 'Messages received',
            },
            median_first_response_time: {
                tooltip: `The time between the first message from a customer and the first response from an agent.
                 Messages sent by rules are not taken into account. (median)`,
                label: 'First response time',
            },
            median_resolution_time: {
                tooltip: `The time between the first message from a customer and the moment the ticket 
                   has been closed by an agent or a rule. Only tickets with a least one response 
                   from an agent or a rule are taken into account. (median)`,
                label: 'Resolution time',
            },
            total_one_touch_tickets: {
                tooltip: 'Percentage of tickets closed with only one response from an agent or a rule.',
                label: 'One-touch tickets',
            },
        }

    },
    [RESOLUTION_TIME]: {
        helpText: `The time between the first message from a customer and the moment the ticket 
                   has been closed by an agent or a rule. Only tickets with a least one response 
                   from an agent or a rule are taken into account.`,
        style: 'line',
        downloadable: true,
        lines: {
            '50%': {
                label: 'median',
                backgroundColor: '#ffb584',
                borderWidth: 0,
                borderColor: '#ffb584',
            },
            '90%': {
                label: '95%',
                backgroundColor: '#ff6b80',
                borderWidth: 0,
                borderColor: '#ff6b80',
            }
        },
        options: (legend) => ({
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
                    gridLines: defaultXAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb
                    })
                }],
                yAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    gridLines: defaultYAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        min: 0,
                        suggestedMax: 1,
                        callback: formatDurationAxeCb
                    }),
                }]
            }
        })
    },
    [FIRST_RESPONSE_TIME]: {
        helpText: `The time between the first message from a customer 
                   and the first response from an agent. Messages sent by rules are not taken into account.`,
        style: 'line',
        downloadable: true,
        lines: {
            '50%': {
                label: 'median',
                backgroundColor: '#8892f2',
                borderWidth: 0,
                borderColor: '#8892f2',
            },
            '90%': {
                label: '95%',
                backgroundColor: '#ff6b80',
                borderWidth: 0,
                borderColor: '#ff6b80',
            }
        },
        options: (legend) => ({
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
                    gridLines: defaultXAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb
                    })
                }],
                yAxes: [{
                    scaleLabel: _merge({}, defaultScaleLabel, {
                        labelString: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    gridLines: defaultYAxeGridLines,
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
const formatDurationAxeCb = (val) => formatDuration(val, 1)


const formatDateAxeCb = (val) => {
    return moment.unix(val).format('MMM Do')
}

// hide number of tickets if it's not an int
const formatTicketAxeCb = (val) => {
    return val % 1 === 0 ? val : ''
}

const formatDurationTooltipCb = (item, data) => {
    return `${data.datasets[item.datasetIndex].label}: ${formatDuration(item.yLabel, 2)}`
}

/**
 *  A view is a statistics page with a bunch of statistics (table and/or charts)
 * name: the name of the view
 * filters: filters available on the view applied on statistics
 * stats: statistics displayed on the view
 */
export const views = fromJS({
    overview: {
        name: 'Overview',
        filters: ['channels', 'agents', 'tags', 'date'],
        // default view available at `app/stats/`
        link: '',
        stats: [
            OVERVIEW,
            SUPPORT_VOLUME,
            RESOLUTION_TIME,
            FIRST_RESPONSE_TIME,
        ]
    },
    tags: {
        name: 'Tags',
        filters: ['channels', 'date'],
        link: 'tags',
        stats: [
            TICKETS_PER_TAG,
        ]
    },
    channels: {
        name: 'Channels',
        filters: ['channels', 'date'],
        link: 'channels',
        stats: [
            TICKETS_CREATED_PER_CHANNEL_PER_DAY,
            TICKETS_CREATED_PER_CHANNEL,
        ]
    },
    agents: {
        name: 'Agents',
        filters: ['channels', 'date'],
        link: 'agents',
        stats: [
            TICKETS_CLOSED_PER_AGENT_PER_DAY,
            TICKETS_CLOSED_PER_AGENT
        ]
    },
    macros: {
        name: 'Macros',
        filters: ['channels', 'date'],
        link: 'macros',
        stats: [
            MESSAGES_SENT_PER_MACRO
        ]
    },
})
