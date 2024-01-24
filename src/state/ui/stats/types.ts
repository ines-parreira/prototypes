import {PayloadActionCreator} from '@reduxjs/toolkit'
import {StatsFilters} from 'models/stat/types'

import {FETCH_STAT_ENDED, FETCH_STAT_STARTED} from './constants'

export type StatsState = {
    fetchingMap: {
        [key: string]: boolean | undefined
    }
    isFilterDirty: boolean
    cleanStatsFilters: StatsFilters | null
}

export type StatsAction = FetchStatEndedAction | FetchStatStartedAction

export type FetchStatEndedAction = PayloadActionCreator<
    {statName: string; resourceName: string},
    typeof FETCH_STAT_ENDED
>

export type FetchStatStartedAction = PayloadActionCreator<
    {statName: string; resourceName: string},
    typeof FETCH_STAT_STARTED
>

export enum OverviewMetric {
    CustomerSatisfaction = 'customer_satisfaction',
    MedianFirstResponseTime = 'median_first_response_time',
    MessagesPerTicket = 'messages_per_ticket',
    MessagesSent = 'messages_sent',
    OpenTickets = 'open_tickets',
    MedianResolutionTime = 'median_resolution_time',
    TicketsClosed = 'tickets_closed',
    TicketsCreated = 'tickets_created',
    TicketsReplied = 'tickets_replied',
}

export enum TableColumn {
    AgentName = 'agent_name',
    CustomerSatisfaction = 'agent_customer_satisfaction',
    MedianFirstResponseTime = 'agent_median_first_response_time',
    MedianResolutionTime = 'agent_median_resolution_time',
    MessagesSent = 'agent_messages_sent',
    PercentageOfClosedTickets = 'agent_percentage_of_closed_tickets',
    ClosedTickets = 'agent_closed_tickets',
    RepliedTickets = 'agent_replied_tickets',
    OneTouchTickets = 'agent_one_touch_tickets',
    OnlineTime = 'agent_online_time',
}

export enum TableViewIdentifier {
    AgentPerformanceMetrics = 'agent_performance_metrics',
}

export type TableViewColumn = {
    id: TableColumn
    visibility: boolean | null
}

export type TableView = {
    id: string
    name: string
    metrics: TableViewColumn[]
}

export type TableSetting = {
    active_view: TableViewIdentifier | string
    views: TableView[]
}
