import React, {ComponentType, ReactElement, ReactNode, ReactText} from 'react'
import {fromJS, Map, List} from 'immutable'
import {Link} from 'react-router-dom'
import moment from 'moment'
import _merge from 'lodash/merge'
import _isString from 'lodash/isString'

import {ChartType, Scale, TooltipItem} from 'chart.js'

import {TicketChannel} from '../business/types/ticket'
import {formatDuration} from '../pages/stats/common/utils'
import {TagLabel} from '../pages/common/utils/labels'
import {IntegrationType} from '../models/integration/types'
import {IntentName} from '../models/intent/types'
import {humanizeString, lightenDarkenColor, toImmutable} from '../utils'
import StatCurrentDate from '../pages/stats/common/components/StatCurrentDate'
import TicketsClosedPerAgentViewLink from '../pages/stats/common/TicketsClosedPerAgentViewLink'
import TicketsCreatedPerTagViewLink from '../pages/stats/common/TicketsCreatedPerTagViewLink'
import TicketsCreatedPerChannelViewLink from '../pages/stats/common/TicketsCreatedPerChannelViewLink'
import {REASONS_DROPDOWN_OPTIONS} from '../pages/settings/selfService/components/ReportIssueCaseEditor/constants'
import {AutomationAddOnStatsButton} from '../pages/stats/AutomationAddOnStatsButton'
import {SelectableOption} from '../pages/common/forms/SelectField/types'
import {ReportIssueReasons} from '../models/selfServiceConfiguration/types'
import SelfServiceIntegrationsFilter from '../pages/stats/self-service/SelfServiceIntegrationsFilter'

import css from './stats.less'

import {defaults} from 'react-chartjs-2'

// Available Stats. These names should match names in `g/stats/config`
export const OVERVIEW = 'overview'
export const SUPPORT_VOLUME = 'support-volume'
export const RESOLUTION_TIME = 'resolution-time'
export const FIRST_RESPONSE_TIME = 'first-response-time'
export const TICKET_CREATED_PER_HOUR_PER_WEEKDAY =
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
export const SUPPORT_VOLUME_PER_HOUR = 'support-volume-per-hour'
export const AUTOMATION_OVERVIEW = 'automation-overview'
export const AUTOMATION_FLOW = 'automation-flow'
export const AUTOMATION_PER_CHANNEL = 'automation-per-channel'
export const SELF_SERVICE_OVERVIEW = 'self-service-overview'
export const SELF_SERVICE_FLOWS_DISTRIBUTION = 'self-service-flows-distribution'
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

export const TICKET_MAX_SUBJECT_LENGTH = 100

export const STORE_INTEGRATION_TYPES = [IntegrationType.Shopify]
export const MESSAGE_INTEGRATION_TYPES = [
    IntegrationType.Email,
    IntegrationType.Gmail,
    IntegrationType.Outlook,
    IntegrationType.Aircall,
    IntegrationType.GorgiasChat,
    IntegrationType.Smooch,
    IntegrationType.SmoochInside,
    IntegrationType.Facebook,
    IntegrationType.Zendesk,
]

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

export type StatConfig = {
    helpText?: string
    helpTextLink?: ComponentType
    style: string
    padding?: string
    downloadable?: boolean
    callbacks?: StatConfigCallbacks
    lines?: Record<string, unknown>
    options?: (value: any) => Record<string, unknown>
    metrics?: {
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
    }[]
    api_resource_name?: string
    formatData?: (stat?: Map<any, any>) => Map<any, any> | undefined
    axisHelpers?: Record<string, string>
    component?: ComponentType
    hasBusinessHoursHighlight?: boolean
    colorMap?: {[key: string]: string}
    priority?: {[key: string]: number}
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
                api_resource_name: 'users-statuses',
                label: 'Agents online',
                formatData: (data: Map<any, any>) => {
                    return (data.get('lines') as List<any>)
                        .filter(
                            (value: List<any>) =>
                                value.getIn([1, 'value']) as boolean
                        )
                        .count()
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
                                <div className={css.moreAgents}>
                                    +{dataLength - 25} more
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                api_resource_name: 'users-statuses',
                label: 'Agents offline',
                formatData: (data: Map<any, any>) => {
                    return (data.get('lines') as List<any>)
                        .filter(
                            (value: List<any>) => !value.getIn([1, 'value'])
                        )
                        .count()
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
                                <div className={css.moreAgents}>
                                    +{dataLength - 25} more
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                api_resource_name: 'open-tickets-assignment-statuses',
                label: 'Assigned open tickets',
                tooltip: 'Total number of open tickets assigned to an agent',
                formatData: (data: Map<any, any>) => {
                    return data.getIn([0, 'value']) as number
                },
            },
            {
                api_resource_name: 'open-tickets-assignment-statuses',
                label: 'Unassigned open tickets',
                tooltip:
                    'Total number of open tickets that are not assigned to an agent',
                formatData: (data: Map<any, any>) => {
                    return data.getIn([1, 'value']) as number
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
                                      .utc(
                                          moment.unix(
                                              parseInt(
                                                  this.getLabelForValue(val)
                                              )
                                          )
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
            cell: ({value}) => {
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
        formatData: (data?: Map<any, any>) => {
            if (!data) {
                return data
            }
            const openTicketsIndex = (
                data.getIn(['axes', 'x']) as List<any>
            ).findIndex((x: Map<any, any>) => x.get('name') === 'Open tickets')
            const ticketsDetailsIndex = (
                data.getIn(['axes', 'x']) as List<any>
            ).findIndex(
                (x: Map<any, any>) =>
                    x.get('name') === 'Open tickets per channel'
            )
            const onlineTimeIndex = (
                data.getIn(['axes', 'x']) as List<any>
            ).findIndex((x: Map<any, any>) => x.get('name') === 'Online time')
            const agentTimezoneIndex = (
                data.getIn(['axes', 'x']) as List<any>
            ).findIndex(
                (x: Map<any, any>) => x.get('name') === 'Agent timezone'
            )
            const onlineIndex = (
                data.getIn(['axes', 'x']) as List<any>
            ).findIndex((x: Map<any, any>) => x.get('name') === 'Online')
            const firstSessionIndex = (
                data.getIn(['axes', 'x']) as List<any>
            ).findIndex((x: Map<any, any>) => x.get('name') === 'First Session')
            const lastSessionIndex = (
                data.getIn(['axes', 'x']) as List<any>
            ).findIndex((x: Map<any, any>) => x.get('name') === 'Last Session')

            return data
                .setIn(
                    ['axes', 'x', onlineTimeIndex, 'type'],
                    StatValueType.OnlineTime
                )
                .setIn(
                    ['axes', 'x', openTicketsIndex, 'type'],
                    StatValueType.TicketDetails
                )
                .deleteIn(['axes', 'x', ticketsDetailsIndex])
                .deleteIn(['axes', 'x', lastSessionIndex])
                .deleteIn(['axes', 'x', firstSessionIndex])
                .deleteIn(['axes', 'x', onlineIndex])
                .deleteIn(['axes', 'x', agentTimezoneIndex])
                .update('lines', (lines: List<any>) =>
                    lines.map((line: List<any>) =>
                        line.reduce(
                            (
                                acc?: List<any> | undefined,
                                value?: Map<any, any>,
                                index?: number
                            ) => {
                                if (!acc || !value) {
                                    return acc!
                                }

                                return index === openTicketsIndex
                                    ? acc.push(
                                          value.set(
                                              'details',
                                              line.getIn([
                                                  ticketsDetailsIndex,
                                                  'value',
                                              ])
                                          )
                                      )
                                    : index === onlineTimeIndex
                                    ? acc.push(
                                          value.set(
                                              'extra',
                                              fromJS({
                                                  timezone: line.getIn([
                                                      agentTimezoneIndex,
                                                      'value',
                                                  ]),
                                                  isOnline: line.getIn([
                                                      onlineIndex,
                                                      'value',
                                                  ]),
                                                  firstSession: line.getIn([
                                                      firstSessionIndex,
                                                      'value',
                                                  ]),
                                                  lastSession: line.getIn([
                                                      lastSessionIndex,
                                                      'value',
                                                  ]),
                                              })
                                          )
                                      )
                                    : [
                                          ticketsDetailsIndex,
                                          agentTimezoneIndex,
                                          onlineIndex,
                                          firstSessionIndex,
                                          lastSessionIndex,
                                      ].includes(index!)
                                    ? acc
                                    : acc.push(value)
                            },
                            fromJS([])
                        )
                    )
                )
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
                    <TagLabel decoration={tagColors.get(tagName.get('value'))}>
                        {tagName.get('value')}
                    </TagLabel>
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
                api_resource_name: 'total-tickets-created',
                label: 'Tickets created',
                name: 'total_new_tickets',
                tooltip: 'Number of tickets created',
            },
            {
                api_resource_name: 'total-tickets-replied',
                label: 'Tickets replied',
                name: 'total_replied_tickets',
                tooltip: 'Number of tickets replied by agents',
            },
            {
                api_resource_name: 'total-tickets-closed',
                label: 'Tickets closed',
                name: 'total_closed_tickets',
                tooltip:
                    'Number of tickets closed (if a ticket was closed multiple times, we only count the last time). This metric can evolve over time if tickets are reopened and closed on the following days.',
            },
            {
                api_resource_name: 'total-messages-sent',
                label: 'Messages sent',
                name: 'total_messages_sent',
                tooltip: 'Number of messages sent by agents and rules',
            },
            {
                api_resource_name: 'total-messages-received',
                label: 'Messages received',
                name: 'total_messages_received',
                tooltip: 'Number of messages received from customers',
            },
            {
                api_resource_name: 'median-first-response-time',
                label: 'First response time',
                name: 'median_first_response_time',
                tooltip:
                    "Median time between the first message from a customer and the first response from an agent (messages sent by rules don't count)",
            },
            {
                api_resource_name: 'median-resolution-time',
                label: 'Resolution time',
                name: 'median_resolution_time',
                tooltip:
                    'Median time between the first message from a customer and the moment a ticket with at least one response is closed by an agent or a rule',
            },
            {
                api_resource_name: 'total-one-touch-tickets',
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
    [TICKET_CREATED_PER_HOUR_PER_WEEKDAY]: {
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
                label: 'Percentage of feedback',
                tooltip:
                    'Percentage of messages with a feedback on the detected intents',
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
                label: 'Get access to more automations',
                name: 'more_automations',
                // @ts-ignore
                component: AutomationAddOnStatsButton,
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
                        callback: formatNumber,
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
        labelStyle: 'centered',
        metrics: [
            {
                name: 'total_interactions',
                label: 'Self-service requests',
                tooltip:
                    'Number of times customers complete a self-service request using Track, Return, Cancel or Report an Issue flows.',
            },
            {
                name: 'tickets_deflected',
                label: 'Automated requests',
                tooltip:
                    "Percentage of self-service requests automated by using the Track flow. Automated requests don't create any tickets.",
            },
            {
                name: 'total_unique_customers',
                label: 'Unique customers',
                tooltip:
                    'Number of unique customers who completed at least one self-service request.',
            },
            {
                name: 'tickets_created',
                label: 'Tickets created',
                tooltip:
                    'Number of self-service requests made by Return, Cancel and Report Issues flows. These requests create auto-generated chat tickets that are easier to handle by agents.',
            },
            // {
            //     name: 'self-service_usage',
            //     label: 'Self-service usage',
            //     tooltip:
            //         'Percentage of self-service requests (including automated ones) compared to the total number of chat tickets (live chats and self-service requests) within the selected stores.',
            // },
        ],
    },
    [SELF_SERVICE_FLOWS_DISTRIBUTION]: {
        style: 'normalized-bar',
        padding: '0px 30px 30px 30px',
        downloadable: true,
        totalOptions: {
            label: 'Total interactions',
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
            // other_tickets: {
            //     label: 'Live chat tickets',
            //     color: '#D2D7DE',
            // },
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

                    return <>{translatedIssue || value}</>
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
            'Percentage of tickets':
                'Percentage of tickets for a given reason compared to all auto-generated chat tickets  when customers report an issue in self-service.',
        },
        style: 'table',
        padding: '6px 30px 30px 30px',
        downloadable: true,
        tableOptions: {
            showLines: 6,
        },
        callbacks: {
            cell: ({value, axis}) => {
                if (axis.name === 'Reason') {
                    const translatedIssue = (
                        REASONS_DROPDOWN_OPTIONS as SelectableOption[]
                    ).find(
                        ({value: dropDownValue}) => value === dropDownValue
                    )?.label

                    return value === ReportIssueReasons.REASON_OTHER ? (
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <h5 style={{margin: 16}}>
                                {translatedIssue || value}
                            </h5>
                            <Link to="/app/settings/self-service">
                                Customize Report Issues
                            </Link>
                        </div>
                    ) : (
                        <h5 style={{margin: 16}}>{translatedIssue || value}</h5>
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

function formatNumber(this: Scale<any>, value: number) {
    return humanizeString(this.getLabelForValue(value))
}

/**
 *  A view is a statistics page with a bunch of statistics (table and/or charts)
 * name: the name of the view
 * filters: filters available on the view applied on statistics
 * stats: statistics displayed on the view
 */
export const liveViews: Map<any, any> = fromJS({
    'live-overview': {
        name: 'Overview',
        title: 'Live overview',
        description:
            'Get a live overview of the current activity of your support team, including agent status, open tickets, and volume of tickets you are handling throughout the day.',
        url: 'https://docs.gorgias.com/statistics/statistics#data_sets',
        filters: [{type: 'channels'}, {type: 'agents'}],
        link: 'live-overview',
        stats: [LIVE_OVERVIEW_METRICS, CURRENT_DATE, SUPPORT_VOLUME_PER_HOUR],
    },
    'live-agents': {
        name: 'Agents',
        title: 'Live agents',
        description:
            'Live Agents will show you the work agents have accomplished over the day.',
        url: 'https://docs.gorgias.com/statistics/statistics#data_sets',
        filters: [{type: 'channels'}, {type: 'agents'}],
        link: 'live-agents',
        stats: [CURRENT_DATE, USERS_PERFORMANCE_OVERVIEW],
    },
})

export const supportPerformanceViews: Map<any, any> = fromJS({
    'support-performance-overview': {
        name: 'Overview',
        title: 'Performance overview',
        description: `Get an overview of the most important statistics about your customer service.
Metrics such as volume of tickets, first response time and resolution time are key when it comes to
providing excellent customer support.`,
        url: 'https://docs.gorgias.com/statistics/statistics#overview',
        filters: [
            {
                type: 'integrations',
                options: {allowedTypes: MESSAGE_INTEGRATION_TYPES},
            },
            {type: 'channels'},
            {type: 'agents'},
            {type: 'tags'},
            {type: 'period'},
        ],
        // default view available at `app/stats/`
        link: 'support-performance-overview',
        stats: [
            OVERVIEW,
            SUPPORT_VOLUME,
            RESOLUTION_TIME,
            FIRST_RESPONSE_TIME,
            TICKET_CREATED_PER_HOUR_PER_WEEKDAY,
        ],
    },
    tags: {
        name: 'Tags',
        description: `Tags statistics will show you how many tickets were created during this time period and have a
tag attached to them. `,
        url: 'https://docs.gorgias.com/statistics/statistics#tags',
        filters: [
            {
                type: 'integrations',
                options: {allowedTypes: MESSAGE_INTEGRATION_TYPES},
            },
            {type: 'channels'},
            {type: 'tags'},
            {type: 'period'},
        ],
        link: 'tags',
        stats: [TICKETS_PER_TAG],
    },
    channels: {
        name: 'Channels',
        description: `Channel statistics to get a clear view of your ticket volume based on the different communication
channels such as Facebook Messenger, Instagram Comments, Email, Chat, etc...`,
        url: 'https://docs.gorgias.com/statistics/statistics#channels',
        filters: [
            {
                type: 'integrations',
                options: {allowedTypes: MESSAGE_INTEGRATION_TYPES},
            },
            {type: 'channels'},
            {type: 'period'},
        ],
        link: 'channels',
        stats: [
            TICKETS_CREATED_PER_CHANNEL_PER_DAY,
            TICKETS_CREATED_PER_CHANNEL,
        ],
    },
    'support-performance-agents': {
        name: 'Agents',
        description: `Agents statistics will show you how many tickets were closed by each agent during this period.`,
        url: 'https://docs.gorgias.com/statistics/statistics#agents',
        filters: [
            {
                type: 'integrations',
                options: {allowedTypes: MESSAGE_INTEGRATION_TYPES},
            },
            {type: 'channels'},
            {type: 'agents'},
            {type: 'period'},
        ],
        link: 'support-performance-agents',
        stats: [TICKETS_CLOSED_PER_AGENT_PER_DAY, TICKETS_CLOSED_PER_AGENT],
    },
    satisfaction: {
        name: 'Satisfaction',
        description: `Satisfaction survey statistics allow you to measure how good is the support your team is providing over time.
How many surveys have been sent, response rate, average scores and more. `,
        url: 'https://docs.gorgias.com/statistics/statistics#satisfaction',
        filters: [
            {
                type: 'integrations',
                options: {allowedTypes: MESSAGE_INTEGRATION_TYPES},
            },
            {
                type: 'channels',
                options: [TicketChannel.Email, TicketChannel.Chat],
            },
            {
                type: 'score',
                minValue: SATISFACTION_SURVEY_MIN_SCORE,
                maxValue: SATISFACTION_SURVEY_MAX_SCORE,
                variant: 'star',
                reverse: true,
            },
            {type: 'agents'},
            {type: 'tags'},
            {type: 'period'},
        ],
        link: 'satisfaction',
        stats: [SATISFACTION_SURVEYS, LATEST_SATISFACTION_SURVEYS],
    },
    revenue: {
        name: 'Revenue',
        description: `Revenue statistics allow you to measure how much money your support team is generating by
helping customers through the purchasing journey.`,
        url: 'https://docs.gorgias.com/statistics/revenue-statistics',
        filters: [
            {
                type: 'integrations',
                options: {
                    allowedTypes: STORE_INTEGRATION_TYPES,
                    isMultiple: false,
                    isRequired: true,
                },
            },
            {type: 'channels'},
            {type: 'tags'},
            {type: 'period'},
        ],
        link: 'revenue',
        stats: [
            REVENUE_OVERVIEW,
            REVENUE_PER_DAY,
            REVENUE_PER_AGENT,
            REVENUE_PER_TICKET,
        ],
    },
})

export const automationViews: Map<any, any> = fromJS({
    automation: {
        name: 'Overview',
        title: 'Automation Overview',
        description: `The automation overview records how many customer interactions are automated
(answered and closed without agent intervention) thanks to Gorgias automation rules.
You can see at a glance how many interactions are automated depending on its source and the automation
tool used to answer it.`,
        url: 'https://docs.gorgias.com/statistics/statistics',
        filters: [
            {
                type: 'integrations',
                options: {allowedTypes: MESSAGE_INTEGRATION_TYPES},
            },
            {type: 'channels'},
            {type: 'period'},
        ],
        link: 'automation',
        stats: [AUTOMATION_OVERVIEW, AUTOMATION_FLOW, AUTOMATION_PER_CHANNEL],
    },
    macros: {
        name: 'Macros',
        description: `Macro statistics is an excellent way to ensure your agents are very efficient by using macros.
It also shows what macros are being used the most often so you can you can provide this information elsewhere in order
to help reduce your support inquiries.`,
        url: 'https://docs.gorgias.com/statistics/statistics#macros',
        filters: [
            {
                type: 'integrations',
                options: {allowedTypes: MESSAGE_INTEGRATION_TYPES},
            },
            {type: 'channels'},
            {type: 'period'},
        ],
        link: 'macros',
        stats: [MESSAGES_SENT_PER_MACRO],
    },
    intents: {
        name: 'Intents',
        description: `Intents statistics on ticket messages give you an overview of the most reccurrent issues your customers face.
Intents can be used in rules and macros to automate your ticket-reply workflow.`,
        url: 'https://docs.gorgias.com/intents-sentiments/customer-intents',
        filters: [
            {
                type: 'channels',
                options: [
                    TicketChannel.Api,
                    TicketChannel.Chat,
                    TicketChannel.Email,
                    TicketChannel.Facebook,
                    TicketChannel.FacebookMention,
                    TicketChannel.FacebookMessenger,
                    TicketChannel.InstagramAdComment,
                    TicketChannel.InstagramComment,
                    TicketChannel.Phone,
                    TicketChannel.Sms,
                ],
            },
            {type: 'period'},
        ],
        link: 'intents',
        stats: [
            INTENTS_OVERVIEW,
            INTENTS_BREAKDOWN_PER_DAY,
            INTENTS_OCCURRENCE,
        ],
    },
    'self-service': {
        name: 'Self-service',
        description: () => (
            <div>
                Self-service statistics give you an overview of the performance
                of your self-service features which can automate tickets and
                save you time. This view shows data from the{' '}
                <b>Chat channels and the Help centers combined</b>.
            </div>
        ),
        url: 'https://docs.gorgias.com/statistics/self-service-statistics',
        filters: [
            {
                type: 'integrations',
                options: {
                    customFilter: SelfServiceIntegrationsFilter,
                },
            },
            {type: 'period'},
        ],
        link: 'self-service',
        stats: [
            SELF_SERVICE_OVERVIEW,
            SELF_SERVICE_FLOWS_DISTRIBUTION,
            SELF_SERVICE_SECTION_REPORT_ISSUE,
            SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES,
            SELF_SERVICE_TOP_REPORTED_ISSUES,
            SELF_SERVICE_SECTION_RETURN,
            SELF_SERVICE_MOST_RETURNED_PRODUCTS,
        ],
    },
})

export const views = liveViews.merge(supportPerformanceViews, automationViews)
