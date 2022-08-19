import React, {ComponentType, ReactElement, ReactNode, ReactText} from 'react'
import {Map, List} from 'immutable'
import {Link} from 'react-router-dom'
import moment from 'moment'
import _merge from 'lodash/merge'
import _isString from 'lodash/isString'
import {ChartType, Scale, TooltipItem} from 'chart.js'
import {defaults} from 'react-chartjs-2'

import {formatDuration, formatNumber} from '../pages/stats/common/utils'
import {TagLabel} from '../pages/common/utils/labels'
import {IntentName} from '../models/intent/types'
import {humanizeString, lightenDarkenColor, toImmutable} from '../utils'
import StatCurrentDate from '../pages/stats/common/components/StatCurrentDate'
import TicketsClosedPerAgentViewLink from '../pages/stats/common/TicketsClosedPerAgentViewLink'
import TicketsCreatedPerTagViewLink from '../pages/stats/common/TicketsCreatedPerTagViewLink'
import TicketsCreatedPerChannelViewLink from '../pages/stats/common/TicketsCreatedPerChannelViewLink'
import {REASONS_DROPDOWN_OPTIONS} from '../pages/settings/selfService/components/ReportIssueCaseEditor/constants'
import {AutomationStatsSelfServiceMetric} from '../pages/stats/AutomationStatsSelfServiceMetric'
import {SelectableOption} from '../pages/common/forms/SelectField/types'
import {ReportIssueReasons} from '../models/selfServiceConfiguration/types'

import css from './stats.less'

// Available Stats. These names should match names in `g/stats/config`
export const OVERVIEW = 'overview'
export const TOTAL_TICKETS_CREATED = 'total-tickets-created'
export const TOTAL_TICKETS_REPLIED = 'total-tickets-replied'
export const TOTAL_TICKETS_CLOSED = 'total-tickets-closed'
export const TOTAL_MESSAGES_SENT = 'total-messages-sent'
export const TOTAL_MESSAGES_RECEIVED = 'total-messages-received'
export const MEDIAN_FIRST_RESPONSE_TIME = 'median-first-response-time'
export const MEDIAN_RESOLUTION_TIME = 'median-resolution-time'
export const TOTAL_ONE_TOUCH_TICKETS = 'total-one-touch-tickets'
export const SUPPORT_VOLUME = 'support-volume'
export const RESOLUTION_TIME = 'resolution-time'
export const FIRST_RESPONSE_TIME = 'first-response-time'
export const TICKETS_CREATED_PER_HOUR_PER_WEEKDAY =
    'tickets-created-per-hour-per-weekday'
export const TICKETS_PER_TAG = 'tickets-per-tag'
export const TICKETS_CREATED_PER_CHANNEL = 'tickets-created-per-channel'
export const TICKETS_CREATED_PER_CHANNEL_PER_DAY =
    'tickets-created-per-channel-per-day'
export const TICKETS_CLOSED_PER_AGENT = 'tickets-closed-per-agent'
export const TICKETS_CLOSED_PER_AGENT_PER_DAY =
    'tickets-closed-per-agent-per-day'
export const MESSAGES_SENT_PER_MACRO = 'messages-sent-per-macro'
export const SATISFACTION_SURVEYS = 'satisfaction-surveys'
export const LATEST_SATISFACTION_SURVEYS = 'latest-satisfaction-surveys'
export const REVENUE_OVERVIEW = 'revenue-overview'
export const REVENUE_PER_AGENT = 'revenue-per-agent'
export const REVENUE_PER_DAY = 'revenue-per-day'
export const REVENUE_PER_TICKET = 'revenue-per-ticket'
export const INTENTS_OVERVIEW = 'intents-overview'
export const INTENTS_BREAKDOWN_PER_DAY = 'intents-breakdown-per-day'
export const INTENTS_OCCURRENCE = 'intents-occurrence'
export const CURRENT_DATE = 'current-date'
export const USERS_PERFORMANCE_OVERVIEW = 'users-performance-overview'
export const LIVE_OVERVIEW_METRICS = 'live-overview-metrics'
export const USERS_STATUSES = 'users-statuses'
export const OPEN_TICKETS_ASSIGNMENT_STATUSES =
    'open-tickets-assignment-statuses'
export const SUPPORT_VOLUME_PER_HOUR = 'support-volume-per-hour'
export const AUTOMATION_OVERVIEW = 'automation-overview'
export const AUTOMATION_FLOW = 'automation-flow'
export const AUTOMATION_PER_CHANNEL = 'automation-per-channel'
export const SELF_SERVICE_OVERVIEW = 'self-service-overview'
export const SELF_SERVICE_CHAT_FLOWS_DISTRIBUTION =
    'self-service-chat-flows-distribution'
export const SELF_SERVICE_VOLUME_PER_FLOW = 'self-service-volume-per-flow'
export const SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE =
    'self-service-article-recommendation-performance'
export const SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE =
    'self-service-quick-response-performance'
export const SELF_SERVICE_HELP_CENTER_FLOWS_DISTRIBUTION =
    'self-service-help-center-flows-distribution'
export const SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES =
    'self-service-product-with-most-issues'
export const SELF_SERVICE_TOP_REPORTED_ISSUES =
    'self-service-top-reported-issues'
export const SELF_SERVICE_MOST_RETURNED_PRODUCTS =
    'self-service-most-returned-products'
export const SELF_SERVICE_TOTAL_INTERACTIONS = 'self-service-total-interactions'
export const SELF_SERVICE_TOTAL_UNIQUE_CUSTOMERS =
    'self-service-total-unique-customers'
export const SELF_SERVICE_SECTION_REPORT_ISSUE =
    'self-service-section-report-issue'
export const SELF_SERVICE_SECTION_RETURN = 'self-service-section-return'
export const SELF_SERVICE_TICKETS_DEFLECTED = 'self-service-tickets-deflected'
export const SELF_SERVICE_TICKETS_CREATED = 'self-service-tickets-created'
export const SELF_SERVICE_USAGE = 'self-service-usage'

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

export const LIVE_STATS_MAX_TICKETS = 5000
export const TICKET_MAX_SUBJECT_LENGTH = 100

type IntentOption = {color: string; label: string}

const getIntentsOptions = (): Record<string, IntentOption> => {
    let colorIdx = -1
    let lightenAmount: number
    let currentCategory = ''

    return Object.values(IntentName).reduce((linesOptions, intent) => {
        const category = intent.split('/')[0] ?? intent
        if (category !== currentCategory) {
            currentCategory = category
            lightenAmount = 20
            colorIdx += 1
        } else {
            lightenAmount -= 20
        }
        linesOptions[intent] = {
            color: lightenDarkenColor(colors[colorIdx], lightenAmount),
            label: humanizeString(intent),
        }
        return linesOptions
    }, {} as Record<IntentName, {color: string; label: string}>)
}

const intentsOptions = getIntentsOptions()

// Default configuration for Chart.js
_merge(defaults, {
    maintainAspectRatio: false,
    clip: 16,
    layout: {
        padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
    },
    title: {
        position: 'top',
        fontSize: 16,
        fontStyle: '600',
        fontColor: 'rgb(41, 43, 44)',
        fontFamily: "'Inter', 'Helvetica Neue', Arial, Helvetica, sans-serif",
    },
    hover: {
        mode: 'index',
        intersect: false,
    },
    animation: {
        duration: 300,
    },
    elements: {
        point: {
            radius: 0,
        },
    },
    plugins: {
        legend: {
            // legend is displayed separately
            display: false,
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            titleFont: {
                size: 15,
            },
            titleColor: mainBlue,
            position: 'nearest',
            bodyColor: mainBlue,
            titleMarginBottom: 15,
            bodySpacing: 10,
            bodyFont: {
                size: 14,
            },
            padding: 20,
            caretPadding: 5,
            backgroundColor: '#ffffff',
            borderColor: '#e2e3ec',
            borderWidth: 1,
            callbacks: {
                title: (tooltipItem: {label: string}[]) => {
                    return formatDateTooltipCb(parseInt(tooltipItem[0].label))
                },
            },
        },
    },
})

const defaultTicks = {
    color: '#b2bddd',
}

const defaultScaleLabel = {
    color: '#b2bddd',
}
const defaultXAxeGridLines = {
    display: false,
    drawBorder: true,
    color: '#dfe3f1',
    borderColor: '#d2d7de',
    borderDash: [2, 4],
    z: -1,
}
const defaultYAxeGridLines = {
    drawBorder: false,
    drawTicks: false,
    color: '#dfe3f1',
    borderDash: [2, 4],
    z: -1,
}

export enum StatValueType {
    User = 'user',
    Delta = 'delta',
    SatisfactionScore = 'satisfaction-score',
    Percent = 'percent',
    Date = 'date',
    Currency = 'currency',
    CustomerLink = 'customer-link',
    SatisfactionSurveyLink = 'satisfaction-survey-link',
    TicketLink = 'ticket-link',
    OnlineTime = 'online-time',
    Number = 'number',
    String = 'string',
    TitleWithLink = 'title-with-link',
    TicketDetails = 'ticket-details',
    Duration = 'duration',
    Object = 'object',
    Product = 'product',
    SelfServiceIssue = 'self-service-issue',
}

export type StatConfigCellCallbackData = {
    line: List<any>
    value: ReactText
    lineIndex: number
    metricIndex: number
    axis: {
        name: string
        type: StatValueType
    }
}

export type StatConfigCellCallbackContext = {
    tagColors?: Map<any, any> | null
}

export type StatConfigCallbacks<T extends ReactNode = ReactNode> = {
    cell: (
        data: StatConfigCellCallbackData,
        context: StatConfigCellCallbackContext
    ) => T
}

export type StatConfigMetric = {
    api_resource_name?: string
    label: string
    tooltip?: string | ((data?: Map<any, any>) => ReactNode)
    name?: string
    formatData?: (data: Map<any, any>) => string | number | null
    type?: string
    fill?: string
    minValue?: number
    maxValue?: number
    variant?: string
    component?: ReactNode
}

export type StatConfig = {
    helpText?: string
    helpTextLink?: ComponentType
    style: string
    padding?: string
    downloadable?: boolean
    callbacks?: StatConfigCallbacks
    lines?: Record<string, unknown>
    options?: (value: any) => Record<string, unknown>
    metrics?: StatConfigMetric[]
    api_resource_name?: string
    axisHelpers?: Record<string, string>
    component?: ComponentType
    hasBusinessHoursHighlight?: boolean
    colorMap?: {[key: string]: string}
    priority?: {[key: string]: number}
    totalOptions?: {
        label: string
        tooltip: string
    }
    tableOptions?: {showLines: number; moreIsBetter?: boolean}
}

export type StatMap = Map<keyof StatConfig, ValueOf<StatConfig>>

// configuration for each stat
export const stats = toImmutable<
    Map<string, StatMap>,
    Record<string, StatConfig>
>({
    [LIVE_OVERVIEW_METRICS]: {
        style: 'key-metrics',
        metrics: [
            {
                api_resource_name: USERS_STATUSES,
                label: 'Agents online',
                formatData: (data: Map<any, any>) => {
                    return formatNumber(
                        (data.get('lines') as List<any>)
                            .filter(
                                (value: List<any>) =>
                                    value.getIn([1, 'value']) as boolean
                            )
                            .count()
                    )
                },
                tooltip: (data?: Map<any, any>) => {
                    if (!data || !data.get('lines')) {
                        return null
                    }
                    const formattedData = (data.get('lines') as List<any>)
                        .filter(
                            (value: List<any>) =>
                                value.getIn([1, 'value']) as boolean
                        )
                        .toJS() as [
                        {
                            type: 'user'
                            value: {id: number; name: string}
                        },
                        {type: 'bool'; value: boolean}
                    ][]
                    const dataLength = formattedData.length

                    return (
                        <div className={css.tooltipWrapper}>
                            {formattedData.slice(0, 25).map((value, index) => {
                                return (
                                    <div
                                        key={`${value[0].value.name}-${index}`}
                                    >
                                        {value[0].value.name}
                                    </div>
                                )
                            })}
                            {dataLength > 25 && (
                                <Link to="/app/stats/live-agents">
                                    +{dataLength - 25} more
                                </Link>
                            )}
                        </div>
                    )
                },
            },
            {
                api_resource_name: USERS_STATUSES,
                label: 'Agents offline',
                formatData: (data: Map<any, any>) => {
                    return formatNumber(
                        (data.get('lines') as List<any>)
                            .filter(
                                (value: List<any>) => !value.getIn([1, 'value'])
                            )
                            .count()
                    )
                },
                tooltip: (data?: Map<any, any>) => {
                    if (!data || !data.get('lines')) {
                        return null
                    }
                    const formattedData = (data.get('lines') as List<any>)
                        .filter(
                            (value: List<any>) => !value.getIn([1, 'value'])
                        )
                        .toJS() as [
                        {
                            type: 'user'
                            value: {id: number; name: string}
                        },
                        {type: 'bool'; value: boolean}
                    ][]
                    const dataLength = formattedData.length

                    return (
                        <div className={css.tooltipWrapper}>
                            {formattedData.slice(0, 25).map((value, index) => {
                                return (
                                    <div
                                        key={`${value[0].value.name}-${index}`}
                                    >
                                        {value[0].value.name}
                                    </div>
                                )
                            })}
                            {dataLength > 25 && (
                                <Link to="/app/stats/live-agents">
                                    +{dataLength - 25} more
                                </Link>
                            )}
                        </div>
                    )
                },
            },
            {
                api_resource_name: OPEN_TICKETS_ASSIGNMENT_STATUSES,
                label: 'Assigned open tickets',
                tooltip: 'Total number of open tickets assigned to an agent',
                formatData: (data: Map<any, any>) => {
                    const ticketsTotal = data.getIn([0, 'value']) as number

                    return ticketsTotal >= LIVE_STATS_MAX_TICKETS
                        ? '5K+'
                        : formatNumber(ticketsTotal)
                },
            },
            {
                api_resource_name: OPEN_TICKETS_ASSIGNMENT_STATUSES,
                label: 'Unassigned open tickets',
                tooltip:
                    'Total number of open tickets that are not assigned to an agent',
                formatData: (data: Map<any, any>) => {
                    const ticketsTotal = data.getIn([1, 'value']) as number

                    return ticketsTotal >= LIVE_STATS_MAX_TICKETS
                        ? '5K+'
                        : formatNumber(ticketsTotal)
                },
            },
        ],
    },
    [SUPPORT_VOLUME_PER_HOUR]: {
        helpText:
            'Number of tickets created, replied by agents and closed today per hour',
        style: 'line',
        hasBusinessHoursHighlight: true,
        lines: {
            created: {
                label: 'Ticket created',
                backgroundColor: '#8892f2',
                borderColor: '#8892f2',
                borderWidth: 2,
                fill: false,
                pointHoverBackgroundColor: '#8892f2',
                pointHoverBorderColor: '#8892f2',
                pointRadius: 4,
                pointHoverRadius: 6,
                lineTension: 0.5,
            },
            replied: {
                label: 'Ticket replied',
                backgroundColor: '#ffb584',
                borderColor: '#ffb584',
                borderWidth: 2,
                fill: false,
                pointHoverBackgroundColor: '#ffb584',
                pointHoverBorderColor: '#ffb584',
                pointRadius: 4,
                pointHoverRadius: 6,
                lineTension: 0.5,
            },
            closed: {
                label: 'Ticket closed',
                backgroundColor: '#a5e5ab',
                borderColor: '#a5e5ab',
                borderWidth: 2,
                fill: false,
                pointHoverBackgroundColor: '#a5e5ab',
                pointHoverBorderColor: '#a5e5ab',
                pointRadius: 4,
                pointHoverRadius: 6,
                lineTension: 0.5,
            },
        },
        options: (legend: Map<any, any>) => ({
            layout: {
                padding: {
                    right: 15,
                },
            },
            plugins: {
                tooltip: {
                    intersect: true,
                    position: 'nearest',
                },
            },
            scales: {
                x: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: false,
                    grid: {
                        ...defaultXAxeGridLines,
                        display: true,
                        borderDash: [2],
                        tickBorderDash: [2],
                    },
                    ticks: _merge({}, defaultTicks, {
                        callback: function (
                            this: Scale<any>,
                            val: any,
                            index: number
                        ) {
                            return index % 2 === 0
                                ? moment
                                      .unix(
                                          parseInt(this.getLabelForValue(val))
                                      )
                                      .format('h a')
                                : ''
                        },
                    }),
                },
                y: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    ticks: _merge({}, defaultTicks, {
                        callback: formatTicketAxeCb,
                    }),
                    grid: {
                        borderColor: '#d2d7de',
                        borderDash: [2],
                        z: -1,
                        tickBorderDash: [2],
                    },
                    min: 0,
                    suggestedMax: 1,
                },
            },
        }),
    },
    [MESSAGES_SENT_PER_MACRO]: {
        helpText: 'Number of messages sent by an agent or a rule per macro',
        style: 'table',
        downloadable: true,
        callbacks: {
            cell: ({value, axis}) => {
                if (
                    _isString(value) &&
                    value.toLowerCase() === 'without macro'
                ) {
                    return (
                        <i>
                            <b>{value}</b>
                        </i>
                    )
                }

                if (axis.name.toLowerCase() === 'macro') {
                    return <div className="fit-cell">{value}</div>
                }

                return value
            },
        } as StatConfigCallbacks<
            ReactElement<JSX.IntrinsicElements['i']> | ReactText
        >,
    },
    [TICKETS_CREATED_PER_CHANNEL]: {
        helpText: 'Number of tickets created per channel',
        style: 'table',
        downloadable: true,
        callbacks: {
            cell: ({value, axis, line}) => {
                if (axis.name.toLowerCase() === 'total') {
                    return (
                        <TicketsCreatedPerChannelViewLink
                            channelName={(line.get(0) as Map<any, any>).get(
                                'value'
                            )}
                        >
                            {value}
                        </TicketsCreatedPerChannelViewLink>
                    )
                }

                return value
            },
        } as StatConfigCallbacks,
    },
    [TICKETS_CREATED_PER_CHANNEL_PER_DAY]: {
        helpText: 'Number of tickets created per channel per day',
        style: 'bar',
        downloadable: true,
        lines: {
            'instagram-comment': {
                label: 'Instagram comment',
                color: '#5c9dbb',
            },
            'instagram-ad-comment': {
                label: 'Instagram ad comment',
                color: '#4ca4d9',
            },
            'instagram-mention-comment': {
                label: 'Instagram mention comment',
                color: '#64A7D0',
            },
            'instagram-direct-message': {
                label: 'Instagram direct message',
                color: '#249ae0',
            },
            facebook: {
                label: 'Facebook',
                color: '#4872db',
            },
            'facebook-messenger': {
                label: 'Facebook Messenger',
                color: '#1787fb',
            },
            'facebook-recommendations': {
                label: 'Facebook recommendations',
                color: '#4887cd',
            },
            twitter: {
                label: 'Twitter',
                color: '#00aced',
            },
            'twitter-direct-message': {
                label: 'Twitter direct message',
                color: '#0089b3',
            },
            chat: {
                label: 'Chat',
                color: '#ffb584',
            },
            email: {
                label: 'Email',
                color: '#ff5eab',
            },
            api: {
                label: 'Gorgias API',
                color: '#e88850',
            },
            aircall: {
                label: 'Aircall',
                color: '#34ba28',
            },
            phone: {
                label: 'Phone',
                color: '#ffe03f',
            },
            yotpo: {
                label: 'Yotpo',
                color: '#064296',
            },
            sms: {
                label: 'Sms',
                color: '#69c473',
            },
        },
        options: (legend: Map<any, any>) => ({
            scales: {
                x: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: true,
                    grid: defaultXAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb,
                    }),
                },

                y: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    stacked: true,
                    ticks: defaultTicks,
                    min: 0,
                    suggestedMax: 1,
                    grid: defaultYAxeGridLines,
                },
            },
        }),
    },
    [CURRENT_DATE]: {
        style: 'element',
        component: StatCurrentDate,
    },
    [USERS_PERFORMANCE_OVERVIEW]: {
        style: 'table',
        downloadable: false,
        axisHelpers: {
            'Online time':
                'Current agent online status and total amount of online time today calculated in your local timezone.',
            'Tickets closed': 'Number of tickets closed per assigned agents',
        },
    },
    [TICKETS_CLOSED_PER_AGENT]: {
        helpText: 'Number of tickets closed per assigned agent',
        style: 'table',
        downloadable: true,
        callbacks: {
            cell: ({value, axis, line}) => {
                if (_isString(value) && value.toLowerCase() === 'unassigned') {
                    return (
                        <i>
                            <b>{value}</b>
                        </i>
                    )
                }
                if (axis.name.toLowerCase() === 'total') {
                    return (
                        <TicketsClosedPerAgentViewLink
                            agentName={(line.get(0) as Map<any, any>).get(
                                'value'
                            )}
                        >
                            {value}
                        </TicketsClosedPerAgentViewLink>
                    )
                }

                return value
            },
        } as StatConfigCallbacks,
    },
    [TICKETS_PER_TAG]: {
        helpText: 'Number of tickets created per tag',
        style: 'table',
        downloadable: true,
        callbacks: {
            cell: (
                {line, value, axis}: StatConfigCellCallbackData,
                {tagColors}
            ) => {
                const tagName = line.first() as Map<any, any>

                if (axis.name.toLowerCase() === 'total') {
                    return (
                        <TicketsCreatedPerTagViewLink
                            tagName={(line.get(0) as Map<any, any>).get(
                                'value'
                            )}
                        >
                            {value}
                        </TicketsCreatedPerTagViewLink>
                    )
                }

                // current cell does not contain a tag name
                if (tagName.get('value') !== value) {
                    return value
                }

                if (
                    (tagName.get('value') as string).toLowerCase() ===
                    'untagged'
                ) {
                    return (
                        <i>
                            <b>{value}</b>
                        </i>
                    )
                }

                if (!tagColors) {
                    return value
                }
                return (
                    <div className="fit-cell">
                        <TagLabel
                            decoration={tagColors.get(tagName.get('value'))}
                        >
                            {tagName.get('value')}
                        </TagLabel>
                    </div>
                )
            },
        } as StatConfigCallbacks,
    },
    [TICKETS_CLOSED_PER_AGENT_PER_DAY]: {
        helpText: 'Number of tickets closed per assigned agent, per day',
        style: 'bar',
        downloadable: true,
        options: (legend: Map<any, any>) => ({
            scales: {
                x: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: true,
                    grid: defaultXAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb,
                    }),
                },

                y: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    ticks: _merge({}, defaultTicks, {
                        callback: formatTicketAxeCb,
                    }),
                    min: 0,
                    suggestedMax: 1,
                    grid: defaultYAxeGridLines,
                    stacked: true,
                },
            },
        }),
    },
    [SUPPORT_VOLUME]: {
        helpText:
            'Number of tickets created, replied by agents and closed per day',
        style: 'bar',
        downloadable: true,
        lines: {
            created: {
                label: 'Ticket created',
                color: '#ffb584',
            },
            replied: {
                label: 'Ticket replied',
                color: '#8892f2',
            },
            closed: {
                label: 'Ticket closed',
                color: '#a5e5ab',
            },
        },
        options: (legend: Map<any, any>) => ({
            scales: {
                x: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: false,
                    grid: defaultXAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb,
                    }),
                },
                y: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    ticks: _merge({}, defaultTicks, {
                        callback: formatTicketAxeCb,
                    }),
                    min: 0,
                    suggestedMax: 1,
                    grid: defaultYAxeGridLines,
                },
            },
        }),
    },
    [OVERVIEW]: {
        style: 'key-metrics',
        metrics: [
            {
                api_resource_name: TOTAL_TICKETS_CREATED,
                label: 'Tickets created',
                name: 'total_new_tickets',
                tooltip: 'Number of tickets created',
            },
            {
                api_resource_name: TOTAL_TICKETS_REPLIED,
                label: 'Tickets replied',
                name: 'total_replied_tickets',
                tooltip: 'Number of tickets replied by agents',
            },
            {
                api_resource_name: TOTAL_TICKETS_CLOSED,
                label: 'Tickets closed',
                name: 'total_closed_tickets',
                tooltip:
                    'Number of tickets closed (if a ticket was closed multiple times, we only count the last time). This metric can evolve over time if tickets are reopened and closed on the following days.',
            },
            {
                api_resource_name: TOTAL_MESSAGES_SENT,
                label: 'Messages sent',
                name: 'total_messages_sent',
                tooltip: 'Number of messages sent by agents and rules',
            },
            {
                api_resource_name: TOTAL_MESSAGES_RECEIVED,
                label: 'Messages received',
                name: 'total_messages_received',
                tooltip: 'Number of messages received from customers',
            },
            {
                api_resource_name: MEDIAN_FIRST_RESPONSE_TIME,
                label: 'First response time',
                name: 'median_first_response_time',
                tooltip:
                    "Median time between the first message from a customer and the first response from an agent (messages sent by rules don't count)",
            },
            {
                api_resource_name: MEDIAN_RESOLUTION_TIME,
                label: 'Resolution time',
                name: 'median_resolution_time',
                tooltip:
                    'Median time between the first message from a customer and the moment a ticket with at least one response is closed by an agent or a rule',
            },
            {
                api_resource_name: TOTAL_ONE_TOUCH_TICKETS,
                label: 'One-touch tickets',
                name: 'total_one_touch_tickets',
                tooltip:
                    'Percentage of tickets closed with only one response from an agent or a rule',
            },
        ],
    },
    [RESOLUTION_TIME]: {
        helpText:
            'Time between the first message from a customer and the moment a ticket with at least one response is closed by an agent or a rule',
        style: 'line',
        downloadable: true,
        lines: {
            '50%': {
                label: 'median',
                backgroundColor: '#ffb584',
                borderWidth: 0,
                borderColor: '#ffb584',
                fill: true,
                pointHoverBackgroundColor: '#ffb584',
            },
            '90%': {
                label: '90%',
                backgroundColor: '#ff6b80',
                borderWidth: 0,
                borderColor: '#ff6b80',
                fill: true,
                pointHoverbackgroundColor: '#ff6b80',
            },
        },
        options: (legend: Map<any, any>) => ({
            plugins: {
                tooltip: {
                    callbacks: {
                        label: formatDurationTooltipCb,
                    },
                },
            },
            scales: {
                x: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    grid: defaultXAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb,
                    }),
                },
                y: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    grid: defaultYAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDurationAxeCb,
                    }),
                    min: 0,
                    suggestedMax: 1,
                },
            },
        }),
    },
    [FIRST_RESPONSE_TIME]: {
        helpText:
            "Time between the first message from a customer and the first response from an agent (messages sent by rules don't count)",
        style: 'line',
        downloadable: true,
        lines: {
            '50%': {
                label: 'median',
                backgroundColor: '#8892f2',
                borderWidth: 0,
                borderColor: '#8892f2',
                fill: true,
                pointHoverBackgroundColor: '#8892f2',
            },
            '90%': {
                label: '90%',
                backgroundColor: '#ff6b80',
                borderWidth: 0,
                borderColor: '#ff6b80',
                fill: true,
                pointHoverBackgroundColor: '#ff6b80',
            },
        },
        options: (legend: Map<any, any>) => ({
            plugins: {
                tooltip: {
                    callbacks: {
                        label: formatDurationTooltipCb,
                    },
                },
            },
            scales: {
                x: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    grid: defaultXAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb,
                    }),
                },
                y: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    grid: defaultYAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDurationAxeCb,
                    }),
                    min: 0,
                    suggestedMax: 1,
                },
            },
        }),
    },
    [TICKETS_CREATED_PER_HOUR_PER_WEEKDAY]: {
        helpText: 'Tickets created per hour per day of the week',
        style: 'per-hour-per-week-table',
        downloadable: true,
    },
    [SATISFACTION_SURVEYS]: {
        style: 'key-metrics',
        api_resource_name: 'satisfaction-surveys',
        metrics: [
            {
                name: 'total_sent',
                label: 'Survey sent',
                tooltip: 'Total number of customer satisfaction surveys sent',
            },
            {
                name: 'response_rate',
                label: 'Response rate',
                tooltip: 'Total number of responses for surveys sent',
                type: 'donut',
                fill: 'success',
                maxValue: 100,
            },
            {
                name: 'average_rating',
                label: 'Average rating',
                tooltip: 'Average score given by the customers',
                type: 'donut',
                fill: 'warning',
                maxValue: SATISFACTION_SURVEY_MAX_SCORE,
            },
            {
                name: 'response_distribution',
                label: 'Response Distribution',
                tooltip: 'Percentage of responses, grouped by the given score',
                type: 'distribution',
                variant: 'star',
                minValue: SATISFACTION_SURVEY_MIN_SCORE,
                maxValue: SATISFACTION_SURVEY_MAX_SCORE,
            },
        ],
    },
    [LATEST_SATISFACTION_SURVEYS]: {
        helpText: 'Latest surveys for selected period',
        style: 'table',
        downloadable: true,
    },
    [REVENUE_OVERVIEW]: {
        style: 'key-metrics',
        api_resource_name: REVENUE_OVERVIEW,
        metrics: [
            {
                name: 'tickets_created',
                label: 'Tickets created',
                tooltip: 'Number of tickets created during the selected period',
            },
            {
                name: 'tickets_converted',
                label: 'Tickets converted',
                tooltip:
                    'Number of tickets converted during the selected period',
            },
            {
                name: 'conversion_ratio',
                label: 'Conversion ratio',
                tooltip: 'Ratio between created vs converted tickets',
            },
            {
                name: 'total_sales_from_support',
                label: 'Total sales from support',
                tooltip: 'Sum of the order amount for each converted ticket',
            },
        ],
    },
    [REVENUE_PER_AGENT]: {
        helpText: 'Breakdown of sales metrics per agent',
        style: 'table',
        downloadable: true,
    },
    [REVENUE_PER_DAY]: {
        helpText: 'Number of converted and created tickets per day',
        style: 'bar',
        downloadable: true,
        lines: {
            tickets_created: {
                label: 'Tickets Created',
                color: '#8892f2',
            },
            tickets_converted: {
                label: 'Tickets Converted',
                color: '#ffb584',
            },
        },
        options: (legend: Map<any, any>) => ({
            scales: {
                x: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: false,
                    grid: defaultXAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb,
                    }),
                },
                y: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    ticks: _merge({}, defaultTicks, {
                        callback: formatTicketAxeCb,
                    }),
                    min: 0,
                    suggestedMax: 1,
                    grid: defaultYAxeGridLines,
                },
            },
        }),
    },
    [REVENUE_PER_TICKET]: {
        helpText: 'Tickets Converted',
        style: 'table',
        downloadable: true,
    },
    [INTENTS_OVERVIEW]: {
        style: 'key-metrics',
        api_resource_name: INTENTS_OVERVIEW,
        metrics: [
            {
                name: 'most_frequent_intent',
                label: 'Most frequent intent',
                tooltip: 'Most common intent detected over the selected period',
            },
            {
                name: 'percentage_message_with_feedback',
                label: 'Percentage of correction',
                tooltip:
                    'Percentage of messages with a correction on the detected intents',
            },
        ],
    },
    [INTENTS_OCCURRENCE]: {
        helpText: 'Intents occurrence on tickets',
        style: 'table',
        downloadable: true,
    },
    [INTENTS_BREAKDOWN_PER_DAY]: {
        helpText: 'Intents detected per day',
        style: 'bar',
        downloadable: true,
        lines: intentsOptions,
        options: (legend: Map<any, any>) => ({
            scales: {
                x: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: true,
                    grid: defaultXAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb,
                    }),
                },

                y: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    ticks: _merge({}, defaultTicks, {
                        callback: formatTicketAxeCb,
                    }),
                    min: 0,
                    suggestedMax: 1,
                    grid: defaultYAxeGridLines,
                    stacked: true,
                },
            },
            plugins: {
                tooltip: {
                    intersect: true,
                    position: 'nearest',
                    filter: (context: TooltipItem<'line'>) => {
                        return context.formattedValue !== '0'
                    },
                },
            },
        }),
    },
    [AUTOMATION_OVERVIEW]: {
        style: 'key-metrics',
        api_resource_name: AUTOMATION_OVERVIEW,
        metrics: [
            {
                label: 'Overall automation rate',
                name: 'overall_automation',
                tooltip:
                    'Percentage of customer interactions automated with Gorgias automation features. ' +
                    'The top 10% merchants of Gorgias are able to reach 33% of overall automation',
            },
            {
                label: 'Automated via rules',
                name: 'automated_via_rules',
                tooltip:
                    'Percentage of customer interactions automated using rules. ',
            },
            {
                label: 'Automated via self-service',
                name: 'automated_via_selfservice',
                tooltip:
                    'Percentage of customer interactions automated using self-service. ',
                component: AutomationStatsSelfServiceMetric,
            },
        ],
    },
    [AUTOMATION_FLOW]: {
        helpText:
            'Vizualize at a glance where your customer interactions come from, if they are automated and if so, from which channel.',
        style: 'sankey',
        downloadable: true,
        colorMap: {
            total: '#ded7de',
            email: '#9bc0fc',
            phone: '#fed7a3',
            chat: '#febea3',
            social: '#f89eab',
            rules: '#24d69d',
            automated: '#4a8df9',
            not_automated: '#ded7de',
            self_service: '#8088D6',
            fallback: '#8fce6e',
        },
        priority: {
            total: 1,
            email: 1,
            phone: 2,
            chat: 3,
            social: 4,
            rules: 1,
            self_service: 2,
            automated: 1,
            not_automated: 2,
        },
        options: () => ({
            animation: false,
            plugins: {
                tooltip: {
                    mode: 'nearest',
                    displayColors: false,
                    titleFont: {
                        size: 12,
                        weight: 'bold',
                    },
                    titleMarginBottom: 4,
                    caretSize: 0,
                },
            },
        }),
    },
    [AUTOMATION_PER_CHANNEL]: {
        helpText: 'Number of customer interactions automated by channels',
        style: 'bar',
        downloadable: true,
        lines: {
            automated: {
                label: 'Automated via rule',
                color: '#24d69d',
            },
            automated_selfserve: {
                label: 'Automated via Self-Service',
                color: '#8088D6',
            },
            not_automated: {
                label: 'Not automated',
                color: '#d2d7de',
            },
        },
        options: (legend: Map<any, any>) => ({
            scales: {
                x: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'x']),
                        display: !!legend.getIn(['axes', 'x']),
                    }),
                    stacked: true,
                    grid: {
                        drawBorder: false,
                        display: false,
                    },
                    ticks: _merge({}, defaultTicks, {
                        callback: formatTickNumber,
                    }),
                },

                y: {
                    stacked: true,
                    ticks: _merge({}, defaultTicks, {
                        min: 0,
                        suggestedMax: 1,
                        callback: formatTicketAxeCb,
                    }),
                    grid: defaultYAxeGridLines,
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (tooltipItem: {label: string}[]) => {
                            return humanizeString(tooltipItem[0].label)
                        },
                    },
                },
            },
        }),
    },
    [SELF_SERVICE_OVERVIEW]: {
        style: 'key-metrics',
        api_resource_name: SELF_SERVICE_OVERVIEW,
        metrics: [
            {
                name: 'chat_self_service_interaction_count',
                label: 'Self-service interactions via chat',
                tooltip:
                    'Number of self-service interactions sent by shopper from your chat widget',
            },
            {
                name: 'chat_self_service_interaction_ratio',
                label: 'Self-service interactions (% of chat tickets)',
                tooltip:
                    'Number of self-service interactions sent by shopper from your chat widget divided by total number of chat interactions you receive',
            },
            {
                name: 'help_center_self_service_interaction_count',
                label: 'Self-service interactions via help center',
                tooltip:
                    'Number of self-service interactions sent by shopper from your help center (you can install self-service on your help center from your help center settings)',
            },
            {
                name: 'automated_interaction_count',
                label: 'Automated interactions',
                tooltip:
                    'Number of automated self-service interactions. Automated interactions do not create tickets.',
            },
            {
                name: 'automated_interaction_ratio',
                label: 'Automated interactions (% of total)',
                tooltip:
                    'Number of automated self-service interactions divided by the total number of self-service interactions across chat and help center.',
            },
        ],
    },
    [SELF_SERVICE_VOLUME_PER_FLOW]: {
        style: 'normalized-line',
        padding: '0px 30px 30px 30px',
        downloadable: true,
        lines: {
            quick_responses: {
                label: 'Quick response',
                backgroundColor: '#1D786B',
                borderColor: '#1D786B',
                borderWidth: 1,
                fill: false,
                pointHoverBackgroundColor: '#1D786B',
                pointHoverBorderColor: '#1D786B',
                pointRadius: 4,
                pointHoverRadius: 6,
                disabledLink: '/app/settings/self-service',
            },
            article_recommendation: {
                label: 'Article recommendation',
                backgroundColor: '#001874',
                borderColor: '#001874',
                borderWidth: 1,
                fill: false,
                pointHoverBackgroundColor: '#001874',
                pointHoverBorderColor: '#001874',
                pointRadius: 4,
                pointHoverRadius: 6,
                disabledLink: '/app/settings/self-service',
            },
            track: {
                label: 'Track order',
                backgroundColor: '#4A8DF9',
                borderColor: '#4A8DF9',
                borderWidth: 1,
                fill: false,
                pointHoverBackgroundColor: '#4A8DF9',
                pointHoverBorderColor: '#4A8DF9',
                pointRadius: 4,
                pointHoverRadius: 6,
                disabledLink: '/app/settings/self-service',
            },
            report_issues: {
                label: 'Report order issue',
                backgroundColor: '#74B510',
                borderColor: '#74B510',
                borderWidth: 1,
                fill: false,
                pointHoverBackgroundColor: '#74B510',
                pointHoverBorderColor: '#74B510',
                pointRadius: 4,
                pointHoverRadius: 6,
                disabledLink: '/app/settings/self-service',
            },
            returns: {
                label: 'Return order',
                backgroundColor: '#8F2CAF',
                borderColor: '#8F2CAF',
                borderWidth: 1,
                fill: false,
                pointHoverBackgroundColor: '#8F2CAF',
                pointHoverBorderColor: '#8F2CAF',
                pointRadius: 4,
                pointHoverRadius: 6,
                disabledLink: '/app/settings/self-service',
            },
            cancellations: {
                label: 'Cancel order',
                color: '#EB6260',
                backgroundColor: '#EB6260',
                borderColor: '#EB6260',
                borderWidth: 1,
                fill: false,
                pointHoverBackgroundColor: '#EB6260',
                pointHoverBorderColor: '#EB6260',
                pointRadius: 4,
                pointHoverRadius: 6,
                disabledLink: '/app/settings/self-service',
            },
        },
        options: (legend: Map<any, any>) => ({
            plugins: {
                tooltip: {
                    intersect: true,
                    position: 'nearest',
                },
            },
            scales: {
                x: {
                    grid: {
                        ...defaultXAxeGridLines,
                        display: true,
                        borderDash: [2],
                        tickBorderDash: [2],
                    },
                    ticks: {
                        ...defaultTicks,
                        callback: formatDateAxeCb,
                    },
                    offset: true,
                },

                y: {
                    title: {
                        ...defaultScaleLabel,
                        text: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    },
                    ticks: {...defaultTicks, padding: 10},
                    min: 0,
                    grid: {
                        ...defaultYAxeGridLines,
                        drawBorder: true,
                        borderDash: [2],
                        tickBorderDash: [2],
                    },
                },
            },
        }),
    },
    [SELF_SERVICE_CHAT_FLOWS_DISTRIBUTION]: {
        style: 'normalized-bar',
        padding: '0px 30px 30px 30px',
        downloadable: true,
        totalOptions: {
            label: 'Total chat interactions',
            tooltip: 'Average distribution of the different self-service flows',
        },
        lines: {
            quick_responses: {
                label: 'Quick response',
                color: '#C593A4',
                disabledLink: '/app/settings/self-service',
            },
            track: {
                label: 'Track (automated)',
                color: '#4A8DF9',
                disabledLink: '/app/settings/self-service',
            },
            report_issues: {
                label: 'Report issue',
                color: '#24D69D',
                disabledLink: '/app/settings/self-service',
            },
            returns: {
                label: 'Return',
                color: '#8088D6',
                disabledLink: '/app/settings/self-service',
            },
            cancellations: {
                label: 'Cancel',
                color: '#FD9B5A',
                disabledLink: '/app/settings/self-service',
            },
            other_tickets: {
                label: 'Chat tickets',
                color: '#D2D7DE',
            },
        },
        options: (legend: Map<any, any>) => ({
            scales: {
                x: {
                    stacked: true,
                    grid: defaultXAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb,
                    }),
                },

                y: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    ticks: _merge({}, defaultTicks, {
                        callback: (value: string) => `${value}%`,
                    }),
                    min: 0,
                    max: 100,
                    grid: defaultYAxeGridLines,
                    stacked: true,
                },
            },
            plugins: {
                tooltip: {
                    intersect: true,
                    position: 'nearest',
                    callbacks: {
                        label: ({
                            dataset,
                            dataIndex,
                        }: {
                            dataset: {
                                label: string
                                dataRaw: number[]
                                data: number[]
                            }
                            dataIndex: number
                        }) =>
                            ` ${dataset.label}: ${
                                dataset.dataRaw[dataIndex]
                            } (${dataset.data[dataIndex].toFixed(0)}%)`,
                    },
                },
            },
        }),
    },
    [SELF_SERVICE_HELP_CENTER_FLOWS_DISTRIBUTION]: {
        style: 'normalized-bar',
        padding: '0px 30px 30px 30px',
        downloadable: true,
        totalOptions: {
            label: 'Total help center interactions',
            tooltip: 'Average distribution of the different self-service flows',
        },
        lines: {
            track: {
                label: 'Track (automated)',
                color: '#4A8DF9',
                disabledLink: '/app/settings/self-service',
            },
            report_issues: {
                label: 'Report issue',
                color: '#24D69D',
                disabledLink: '/app/settings/self-service',
            },
            returns: {
                label: 'Return',
                color: '#8088D6',
                disabledLink: '/app/settings/self-service',
            },
            cancellations: {
                label: 'Cancel',
                color: '#FD9B5A',
                disabledLink: '/app/settings/self-service',
            },
        },
        options: (legend: Map<any, any>) => ({
            scales: {
                x: {
                    stacked: true,
                    grid: defaultXAxeGridLines,
                    ticks: _merge({}, defaultTicks, {
                        callback: formatDateAxeCb,
                    }),
                },

                y: {
                    title: _merge({}, defaultScaleLabel, {
                        text: legend.getIn(['axes', 'y']),
                        display: !!legend.getIn(['axes', 'y']),
                    }),
                    ticks: _merge({}, defaultTicks, {
                        callback: (value: string) => `${value}%`,
                    }),
                    min: 0,
                    max: 100,
                    grid: defaultYAxeGridLines,
                    stacked: true,
                },
            },
            plugins: {
                tooltip: {
                    intersect: true,
                    position: 'nearest',
                    callbacks: {
                        label: ({
                            dataset,
                            dataIndex,
                        }: {
                            dataset: {
                                label: string
                                dataRaw: number[]
                                data: number[]
                            }
                            dataIndex: number
                        }) =>
                            ` ${dataset.label}: ${
                                dataset.dataRaw[dataIndex]
                            } (${dataset.data[dataIndex].toFixed(0)}%)`,
                    },
                },
            },
        }),
    },
    [SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE]: {
        style: 'table',
        downloadable: true,
        tableOptions: {
            showLines: 6,
        },
        callbacks: {
            cell: ({value}) => {
                return value
            },
        } as StatConfigCallbacks<ReactNode>,
    },
    [SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE]: {
        style: 'table',
        downloadable: true,
        tableOptions: {
            showLines: 6,
        },
        callbacks: {
            cell: ({value}) => {
                return value
            },
        } as StatConfigCallbacks<ReactNode>,
    },
    [SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES]: {
        style: 'table',
        downloadable: true,
        callbacks: {
            cell: ({value, axis}) => {
                if (axis.name === 'Issue') {
                    const translatedIssue = (
                        REASONS_DROPDOWN_OPTIONS as SelectableOption[]
                    ).find(
                        ({value: dropDownValue}) => value === dropDownValue
                    )?.label

                    return (
                        <span className="fit-cell">
                            {translatedIssue || value}
                        </span>
                    )
                }

                return value
            },
        } as StatConfigCallbacks<ReactNode>,
    },
    [SELF_SERVICE_TOP_REPORTED_ISSUES]: {
        helpText:
            'Only the reasons you have configured will be displayed below. You can also customize the list of reasons available to your customers depending on the order statuses.',
        helpTextLink: () => (
            <a
                href="https://docs.gorgias.com/self-service/configure-your-self-service-portal"
                target="_blank"
                rel="noopener noreferrer"
            >
                Learn more
            </a>
        ),
        axisHelpers: {
            '% of issues reported':
                'Percentage of tickets for a given reason compared to all auto-generated chat tickets  when customers report an issue in self-service.',
        },
        style: 'table',
        padding: '6px 30px 30px 30px',
        downloadable: true,
        tableOptions: {
            showLines: 6,
            moreIsBetter: true,
        },
        callbacks: {
            cell: ({value, axis}) => {
                if (axis.name === 'Issue') {
                    const translatedIssue = (
                        REASONS_DROPDOWN_OPTIONS as SelectableOption[]
                    ).find(
                        ({value: dropDownValue}) => value === dropDownValue
                    )?.label

                    return value === ReportIssueReasons.REASON_OTHER ? (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                lineHeight: '20px',
                            }}
                        >
                            <h5 style={{margin: 0}} className="mr-2">
                                {translatedIssue || value}
                            </h5>
                            <Link to="/app/settings/self-service">
                                Customize Report Issues
                            </Link>
                        </div>
                    ) : (
                        <h5 style={{margin: 0}}>{translatedIssue || value}</h5>
                    )
                }

                return value
            },
        } as StatConfigCallbacks<ReactNode>,
    },
    [SELF_SERVICE_MOST_RETURNED_PRODUCTS]: {
        style: 'table',
        downloadable: true,
    },
    [SELF_SERVICE_SECTION_REPORT_ISSUE]: {
        style: 'element',
        component: () => <h3 style={{marginBottom: 6}}>Report issues flow</h3>,
    },
    [SELF_SERVICE_SECTION_RETURN]: {
        style: 'element',
        component: () => <h3 style={{marginBottom: 6}}>Returns flow</h3>,
    },
})

// Callbacks to format values of datasets or axes
const formatDurationAxeCb = (value: number) => formatDuration(value, 2)

function formatDateAxeCb(this: Scale<any>, value: number) {
    return moment.unix(parseInt(this.getLabelForValue(value))).format('MMM Do')
}

function formatDateTooltipCb(value: number) {
    return moment.unix(value).format('MMM Do')
}

// hide number of tickets if it's not an int
const formatTicketAxeCb = (val: any) => {
    return val % 1 === 0 ? (val as number) : ''
}

const formatDurationTooltipCb = (ctx: TooltipItem<ChartType>) => {
    return `${ctx.dataset.label || ''}: ${
        formatDuration(ctx.parsed.y, 2) || '0'
    } `
}

function formatTickNumber(this: Scale<any>, value: number) {
    return humanizeString(this.getLabelForValue(value))
}
