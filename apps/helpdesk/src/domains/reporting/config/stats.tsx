import type { ComponentType, ReactElement, ReactNode, ReactText } from 'react'
import React from 'react'

import type { ChartType, Scale, TooltipItem } from 'chart.js'
import { defaults } from 'chart.js'
import classNames from 'classnames'
import type { List, Map } from 'immutable'
import _isString from 'lodash/isString'
import _merge from 'lodash/merge'
import moment from 'moment'
import { Link } from 'react-router-dom'

import { toImmutable } from 'common/utils'
import css from 'domains/reporting/config/stats.less'
import StatCurrentDate from 'domains/reporting/pages/common/components/StatCurrentDate'
import TicketsClosedPerAgentViewLink from 'domains/reporting/pages/common/TicketsClosedPerAgentViewLink'
import {
    formatDuration,
    formatNumber,
} from 'domains/reporting/pages/common/utils'
import { IntentName } from 'models/intent/types'
import { REASONS_DROPDOWN_OPTIONS } from 'models/selfServiceConfiguration/constants'
import { ReportIssueReasons } from 'models/selfServiceConfiguration/types'
import type { SelectableOption } from 'pages/common/forms/SelectField/types'
import { humanizeString, lightenDarkenColor } from 'utils'

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
export const SELF_SERVICE_OVERVIEW_V2 = 'self-service-overview-v2'
export const SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE =
    'self-service-article-recommendation-performance'
export const SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES_AND_RETURN_REQUESTS =
    'self-service-products-with-most-issues-and-return-requests'
export const SELF_SERVICE_TOP_REPORTED_ISSUES =
    'self-service-top-reported-issues'
export const SELF_SERVICE_TOTAL_INTERACTIONS = 'self-service-total-interactions'
export const SELF_SERVICE_TOTAL_UNIQUE_CUSTOMERS =
    'self-service-total-unique-customers'
export const SELF_SERVICE_SECTION_REPORT_ISSUE =
    'self-service-section-report-issue'
export const SELF_SERVICE_SECTION_RETURN = 'self-service-section-return'
export const SELF_SERVICE_TICKETS_DEFLECTED = 'self-service-tickets-deflected'
export const SELF_SERVICE_TICKETS_CREATED = 'self-service-tickets-created'
export const SELF_SERVICE_USAGE = 'self-service-usage'
export const SELF_SERVICE_WORKFLOWS_PERFORMANCE =
    'self-service-workflows-performance'

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

type IntentOption = { color: string; label: string }

const getIntentsOptions = (): Record<string, IntentOption> => {
    let colorIdx = -1
    let lightenAmount: number
    let currentCategory = ''

    return Object.values(IntentName).reduce(
        (linesOptions, intent) => {
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
        },
        {} as Record<IntentName, { color: string; label: string }>,
    )
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
            bodySpacing: 12,
            boxPadding: 8,
            bodyFont: {
                size: 14,
            },
            padding: 20,
            caretPadding: 5,
            backgroundColor: '#ffffff',
            borderColor: '#e2e3ec',
            borderWidth: 1,
            callbacks: {
                title: (tooltipItem: { label: string }[]) => {
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
    AgentAvailability = 'agent-availability',
    ArticleRecommendationAutomationRate = 'article-recommendation-automation-rate',
    Boolean = 'bool',
    Currency = 'currency',
    CustomerLink = 'customer-link',
    Date = 'date',
    Delta = 'delta',
    Duration = 'duration',
    IssueReason = 'issue-reason',
    Issues = 'issues',
    Number = 'number',
    Object = 'object',
    OnlineTime = 'online-time',
    OnlineState = 'online-state',
    Percent = 'percent',
    Product = 'product',
    QuickResponseAutomationRate = 'quick-response-automation-rate',
    QuickResponseTitle = 'quick-response-title',
    SatisfactionScore = 'satisfaction-score',
    SatisfactionSurveyLink = 'satisfaction-survey-link',
    String = 'string',
    TicketDetails = 'ticket-details',
    TicketLink = 'ticket-link',
    Timezone = 'timezone',
    Title = 'title',
    TitleWithLink = 'title-with-link',
    User = 'user',
    WorkflowAutomationRate = 'workflow-automation-rate',
    WorkflowName = 'workflow-name',
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
        context: StatConfigCellCallbackContext,
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
    colorMap?: { [key: string]: string }
    priority?: { [key: string]: number }
    totalOptions?: {
        label: string
        tooltip: string
    }
    tableOptions?: {
        showLines: number
        moreIsBetter?: boolean
        isDeltaPercentage?: boolean
    }
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
                formatData: (data: Map<any, List<any>>) => {
                    if (!data.get('lines')) {
                        return null
                    }
                    return formatNumber(
                        data
                            .get('lines')
                            .filter(
                                (value: List<any>) =>
                                    value.getIn([1, 'value']) as boolean,
                            )
                            .count(),
                    )
                },
                tooltip: (data?: Map<any, any>) => {
                    if (!data || !data.get('lines')) {
                        return null
                    }
                    const formattedData = (data.get('lines') as List<any>)
                        .filter(
                            (value: List<any>) =>
                                value.getIn([1, 'value']) as boolean,
                        )
                        .toJS() as [
                        {
                            type: 'user'
                            value: { id: number; name: string }
                        },
                        { type: 'bool'; value: boolean },
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
                formatData: (data: Map<'lines', List<any>>) => {
                    if (!data.get('lines')) {
                        return null
                    }
                    return formatNumber(
                        data
                            .get('lines')
                            .filter(
                                (value: List<any>) =>
                                    !value.getIn([1, 'value']),
                            )
                            .count(),
                    )
                },
                tooltip: (data?: Map<any, any>) => {
                    if (!data || !data.get('lines')) {
                        return null
                    }
                    const formattedData = (data.get('lines') as List<any>)
                        .filter(
                            (value: List<any>) => !value.getIn([1, 'value']),
                        )
                        .toJS() as [
                        {
                            type: 'user'
                            value: { id: number; name: string }
                        },
                        { type: 'bool'; value: boolean },
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
                formatData: (data: Map<any, List<any>>) => {
                    const ticketsTotal = data.getIn([0, 'value'])

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
                formatData: (data: Map<any, List<any>>) => {
                    const ticketsTotal = data.getIn([1, 'value'])

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
                tension: 0.5,
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
                tension: 0.5,
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
                tension: 0.5,
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
                            index: number,
                        ) {
                            return index % 2 === 0
                                ? moment
                                      .unix(
                                          parseInt(this.getLabelForValue(val)),
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
            cell: ({ value, axis }) => {
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
            'Online status': 'Current agent online status',
            'Tickets closed': 'Number of tickets closed per assigned agents',
            Availability: 'Current agent availability status',
        },
    },
    [TICKETS_CLOSED_PER_AGENT]: {
        helpText: 'Number of tickets closed per assigned agent',
        style: 'table',
        downloadable: true,
        callbacks: {
            cell: ({ value, axis, line }) => {
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
                                'value',
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
                color: '#8892f2',
            },
            replied: {
                label: 'Ticket replied',
                color: '#ffb584',
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
    [SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE]: {
        style: 'table',
        downloadable: true,
        tableOptions: {
            showLines: 6,
        },
        axisHelpers: {
            'Automation rate':
                'Number of interactions resolved by Article Recommendation divided by the total number of times a user is recommended an article.',
            'Served by an agent after article rec':
                'When an interaction is not successfully automated and the customer is served by an agent, it becomes a billable ticket.',
        },
        callbacks: {
            cell: ({ value }) => {
                return value
            },
        },
    },
    [SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES_AND_RETURN_REQUESTS]: {
        style: 'table',
        downloadable: true,
        tableOptions: { showLines: 4 },
    },
    [SELF_SERVICE_TOP_REPORTED_ISSUES]: {
        axisHelpers: {
            '% of issues reported':
                'Percent of issues reported out of all order issues reported.',
        },
        style: 'table',
        padding: '6px 30px 30px 30px',
        downloadable: true,
        tableOptions: {
            showLines: 6,
            moreIsBetter: true,
            isDeltaPercentage: false,
        },
        callbacks: {
            cell: ({ value, axis }) => {
                if (axis.name === 'Issue') {
                    const translatedIssue = (
                        REASONS_DROPDOWN_OPTIONS as SelectableOption[]
                    ).find(
                        ({ value: dropDownValue }) => value === dropDownValue,
                    )?.label

                    return value === ReportIssueReasons.REASON_OTHER ? (
                        <div className={css.customizeReportIssues}>
                            <h5
                                style={{ margin: 0, fontStyle: 'italic' }}
                                className="mr-2"
                            >
                                {translatedIssue || value}
                            </h5>
                            <Link
                                className={css.customizeReportIssues}
                                to="/app/automation"
                            >
                                Customize Report Issues
                                <span className={classNames('material-icons')}>
                                    auto_awesome
                                </span>
                            </Link>
                        </div>
                    ) : (
                        <h5 style={{ margin: 0 }}>
                            {translatedIssue || value}
                        </h5>
                    )
                }

                return value
            },
        },
    },
    [SELF_SERVICE_WORKFLOWS_PERFORMANCE]: {
        style: 'table',
        downloadable: true,
        tableOptions: {
            showLines: 6,
        },
        axisHelpers: {
            'Automation rate':
                'Number of interactions resolved by a Flow divided by the total number of times a user has started a Flow.',
            'Served by an agent after article rec':
                'If a customer is not satisfied with the automated response, a ticket is created.',
            'Drop off':
                "Number of times a customer has started the flow, but hasn't reached the end.",
            'Served by an agent after flow':
                'When an interaction is not successfully automated and the customer is served by an agent, it becomes a billable ticket.',
        },
        callbacks: {
            cell: ({ value }) => {
                return value
            },
        },
    },
    [SELF_SERVICE_SECTION_REPORT_ISSUE]: {
        style: 'element',
        component: () => (
            <h3 style={{ marginBottom: 6 }}>Report issues flow</h3>
        ),
    },
    [SELF_SERVICE_SECTION_RETURN]: {
        style: 'element',
        component: () => <h3 style={{ marginBottom: 6 }}>Returns flow</h3>,
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
