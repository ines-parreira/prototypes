import React from 'react'
import {fromJS} from 'immutable'
import moment from 'moment'
import _merge from 'lodash/merge'
import _isString from 'lodash/isString'
import {defaults} from 'react-chartjs-2'

import {formatDuration} from '../pages/stats/common/utils'
import {TagLabel} from '../pages/common/utils/labels'

import {SHOPIFY_INTEGRATION_TYPE} from '../constants/integration'

import {EMAIL_CHANNEL, CHAT_CHANNEL, SMS_CHANNEL, AIRCALL_CHANNEL, API_CHANNEL} from './ticket'

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
export const SATISFACTION_SURVEYS = 'satisfaction-surveys'
export const LATEST_SATISFACTION_SURVEYS = 'latest-satisfaction-surveys'

export const OLD_REVENUE_OVERVIEW = 'revenue-overview'
export const OLD_SALES_PER_AGENT = 'sales-per-agent'
export const OLD_PRE_SALE_CONVERTED_TICKETS_PER_DAY = 'pre-sale-converted-tickets-per-day'
export const OLD_PRE_SALE_TICKETS = 'pre-sale-tickets'

export const REVENUE_OVERVIEW = 'revenue-overview-v2'
export const REVENUE_PER_AGENT = 'revenue-per-agent-v2'
export const REVENUE_PER_DAY = 'revenue-per-day-v2'
export const REVENUE_PER_TICKET = 'revenue-per-ticket-v2'

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

export const SATISFACTION_SURVEY_MIN_SCORE = 1
export const SATISFACTION_SURVEY_MAX_SCORE = 5
export const SATISFACTION_SURVEY_MAX_COMMENT_LENGTH = 80

export const TICKET_MAX_SUBJECT_LENGTH = 100

export const STORE_INTEGRATION_TYPES = [SHOPIFY_INTEGRATION_TYPE]

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
        metrics: [{
            api_resource_name: 'total-tickets-created',
            label: 'Tickets created',
            tooltip: 'Number of tickets created.',
        }, {
            api_resource_name: 'total-tickets-replied',
            label: 'Tickets replied',
            tooltip: 'Number of tickets replied by agents.',
        }, {
            api_resource_name: 'total-tickets-closed',
            label: 'Tickets closed',
            tooltip: 'Number of tickets closed. If a ticket was closed multiple times, ' +
                'we only take into account the last time it was closed.',
        }, {
            api_resource_name: 'total-messages-sent',
            tooltip: 'Number of messages sent by agents and rules.',
            label: 'Messages sent',
        }, {
            api_resource_name: 'total-messages-received',
            tooltip: 'Number of messages received from customers.',
            label: 'Messages received',
        }, {
            api_resource_name: 'median-first-response-time',
            tooltip: `The time between the first message from a customer and the first response from an agent.
                 Messages sent by rules are not taken into account. (median)`,
            label: 'First response time',
        }, {
            api_resource_name: 'median-resolution-time',
            tooltip: `The time between the first message from a customer and the moment the ticket
                   has been closed by an agent or a rule. Only tickets with at least one response
                   from an agent or a rule are taken into account. (median)`,
            label: 'Resolution time',
        }, {
            api_resource_name: 'total-one-touch-tickets',
            tooltip: 'Percentage of tickets closed with only one response from an agent or a rule.',
            label: 'One-touch tickets',
        }]
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
    [SATISFACTION_SURVEYS]: {
        style: 'key-metrics',
        api_resource_name: 'satisfaction-surveys',
        metrics: [{
            name: 'total_sent',
            label: 'Survey sent',
            tooltip: 'Total number of customer satisfaction surveys sent.',
        }, {
            name: 'response_rate',
            label: 'Response rate',
            tooltip: 'Total number of responses for surveys sent.',
            type: 'donut',
            fill: 'success',
            maxValue: 100
        }, {
            name: 'average_rating',
            label: 'Average rating',
            tooltip: 'Average score given by the customers.',
            type: 'donut',
            fill: 'warning',
            maxValue: SATISFACTION_SURVEY_MAX_SCORE
        }, {
            name: 'response_distribution',
            label: 'Response Distribution',
            tooltip: 'Percentage of responses, grouped by the given score.',
            type: 'distribution',
            variant: 'star',
            minValue: SATISFACTION_SURVEY_MIN_SCORE,
            maxValue: SATISFACTION_SURVEY_MAX_SCORE
        },
        ]
    },
    [LATEST_SATISFACTION_SURVEYS]: {
        helpText: 'Latest surveys for selected period',
        style: 'table',
        downloadable: true,
    },
    [REVENUE_OVERVIEW]: {
        style: 'key-metrics',
        api_resource_name: REVENUE_OVERVIEW,
        metrics: [{
            name: 'tickets_created',
            label: 'Tickets created',
            tooltip: 'Number of tickets created during the selected period.'
        }, {
            name: 'tickets_converted',
            label: 'Tickets converted',
            tooltip: 'Number of tickets converted during the selected period.',
        }, {
            name: 'conversion_ratio',
            label: 'Conversion ratio',
            tooltip: 'Ratio between created vs converted tickets.'
        }, {
            name: 'total_sales_from_support',
            label: 'Total sales from support',
            tooltip: 'Sum of the order amount for each converted ticket.'
        }]
    },
    [REVENUE_PER_AGENT]: {
        helpText: 'Breakdown of sales metrics per agent.',
        style: 'table',
        downloadable: true,
    },
    [REVENUE_PER_DAY]: {
        helpText: 'Number of converted and created tickets per day.',
        style: 'bar',
        downloadable: true,
        lines: {
            tickets_created: {
                label: 'Tickets Created',
                color: '#8892f2'
            },
            tickets_converted: {
                label: 'Tickets Converted',
                color: '#ffb584',
            },
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
    [REVENUE_PER_TICKET]: {
        helpText: 'Tickets Converted',
        style: 'table',
        downloadable: true,
    },
    [OLD_REVENUE_OVERVIEW]: {
        style: 'key-metrics',
        api_resource_name: 'revenue-overview',
        metrics: [{
            name: 'pre_sale_tickets',
            label: 'Pre-sale tickets',
            tooltip: 'All tickets excluding post-sale tickets. Post-sale tickets are tickets that had an order ' +
                'within 45 days before being created, and no order within 7 days after being created.',
        }, {
            name: 'converted_tickets',
            label: 'Converted tickets',
            tooltip: 'Pre-sale that were followed by a sale within 7 days.'
        }, {
            name: 'conversion_rate',
            label: 'Conversion rate',
            tooltip: 'Ratio between pre-sale tickets vs converted tickets.'
        }, {
            name: 'total_sales_from_support',
            label: 'Total sales from support',
            tooltip: 'Sum of the order amount for each converted ticket.'
        }]
    },
    [OLD_SALES_PER_AGENT]: {
        helpText: 'Breakdown of sales metrics per agent.',
        style: 'table',
        downloadable: true,
    },
    [OLD_PRE_SALE_CONVERTED_TICKETS_PER_DAY]: {
        helpText: 'Number of pre-sale and converted tickets per day.',
        style: 'bar',
        downloadable: true,
        lines: {
            pre_sale_tickets: {
                label: 'Pre-sale tickets',
                color: '#ffb584',
            },
            converted_tickets: {
                label: 'Converted tickets',
                color: '#8892f2'
            },
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
    [OLD_PRE_SALE_TICKETS]: {
        helpText: 'Pre-sale and converted tickets',
        style: 'table',
        downloadable: true,
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
export const views = (newRevenueStat: boolean) => {
    const revenueView = {
        name: 'Revenue (Beta)',
        description: `Revenue statistics allow you to measure how much money your support team is generating by
    helping customers through the purchasing journey.<br/>
    <a href="https://docs.gorgias.com/statistics/revenue-statistics" target="_blank">Learn how it works</a>.`,
        filters: [
            {
                type: 'channels',
                options: [EMAIL_CHANNEL, CHAT_CHANNEL, SMS_CHANNEL, AIRCALL_CHANNEL, API_CHANNEL]
            },
            {
                type: 'period'
            }],
        link: 'revenue',
        stats: [
            OLD_REVENUE_OVERVIEW, OLD_SALES_PER_AGENT, OLD_PRE_SALE_CONVERTED_TICKETS_PER_DAY, OLD_PRE_SALE_TICKETS
        ]
    }

    if (newRevenueStat) {
        revenueView.name = 'Revenue'
        revenueView.filters = [
            {type: 'integrations', options: STORE_INTEGRATION_TYPES},
            {type: 'channels'},
            {type: 'period'}
        ]
        revenueView.stats = [
            REVENUE_OVERVIEW, REVENUE_PER_AGENT, REVENUE_PER_DAY, REVENUE_PER_TICKET
        ]
    }

    return fromJS({
        overview: {
            name: 'Overview',
            description: `Get an overview of the most important statistics about your customer service.
Metrics such as volume of tickets, first response time and resolution time are key when it comes to
providing excellent customer support.
<a href="https://docs.gorgias.com/statistics/statistics#overview" target="_blank">Learn more</a>.`,
            filters: [{type: 'channels'}, {type: 'agents'}, {type: 'tags'}, {type: 'period'}],
            // default view available at `app/stats/`
            link: 'overview',
            stats: [
                OVERVIEW,
                SUPPORT_VOLUME,
                RESOLUTION_TIME,
                FIRST_RESPONSE_TIME,
            ]
        },
        tags: {
            name: 'Tags',
            description: `Tags statistics will show you how many tickets were created during this time period and have a
tag attached to them. <a href="https://docs.gorgias.com/statistics/statistics#tags" target="_blank">Learn more</a>.`,
            filters: [{type: 'channels'}, {type: 'tags'}, {type: 'period'}],
            link: 'tags',
            stats: [
                TICKETS_PER_TAG,
            ]
        },
        channels: {
            name: 'Channels',
            description: `Channel statistics to get a clear view of your ticket volume based on the different communication
channels such as Facebook Messenger, Instagram Comments, Email, Chat, etc...
<a href="https://docs.gorgias.com/statistics/statistics#channels" target="_blank">Learn more</a>.`,
            filters: [{type: 'channels'}, {type: 'period'}],
            link: 'channels',
            stats: [
                TICKETS_CREATED_PER_CHANNEL_PER_DAY,
                TICKETS_CREATED_PER_CHANNEL,
            ]
        },
        agents: {
            name: 'Agents',
            description: `Agents statistics will show you how many tickets were closed by each agent during this period.
<a href="https://docs.gorgias.com/statistics/statistics#agents" target="_blank">Learn more</a>.`,
            filters: [{type: 'channels'}, {type: 'period'}],
            link: 'agents',
            stats: [
                TICKETS_CLOSED_PER_AGENT_PER_DAY,
                TICKETS_CLOSED_PER_AGENT
            ]
        },
        macros: {
            name: 'Macros',
            description: `Macro statistics is an excellent way to ensure your agents are very efficient by using macros.
It also shows what macros are being used the most often so you can you can provide this information elsewhere in order
to help reduce your support inquiries.
<a href="https://docs.gorgias.com/statistics/statistics#macros" target="_blank">Learn more</a>.`,
            filters: [{type: 'channels'}, {type: 'period'}],
            link: 'macros',
            stats: [
                MESSAGES_SENT_PER_MACRO
            ]
        },
        satisfaction: {
            name: 'Satisfaction',
            description: `Satisfaction survey statistics allow you to measure how good is the support your team is providing over time.
How many surveys have been sent, response rate, average scores and more. <a href="https://docs.gorgias.com/statistics/statistics#satisfaction" target="_blank">Learn more</a>.`,
            filters: [
                {
                    type: 'channels',
                    options: [EMAIL_CHANNEL, CHAT_CHANNEL]
                },
                {
                    type: 'score',
                    minValue: SATISFACTION_SURVEY_MIN_SCORE,
                    maxValue: SATISFACTION_SURVEY_MAX_SCORE,
                    variant: 'star',
                    reverse: true
                },
                {type: 'agents'}, {type: 'tags'}, {type: 'period'},
            ],
            link: 'satisfaction',
            stats: [
                SATISFACTION_SURVEYS, LATEST_SATISFACTION_SURVEYS
            ]
        },
        revenue: revenueView
    })
}
