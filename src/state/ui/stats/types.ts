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
    CustomerSatisfaction = 'customer_satisfaction_per_agent',
    MedianFirstResponseTime = 'median_first_response_time',
    MedianResolutionTime = 'median_resolution_time',
    MessagesSent = 'messages_sent',
    PercentageOfClosedTickets = 'percentage_of_closed_tickets',
    ClosedTickets = 'closed_tickets',
    RepliedTickets = 'replied_tickets',
    OneTouchTickets = 'one_touch_tickets',
}
