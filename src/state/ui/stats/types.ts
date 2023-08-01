import {PayloadActionCreator} from '@reduxjs/toolkit'

import {FETCH_STAT_ENDED, FETCH_STAT_STARTED} from './constants'

export type StatsState = {
    fetchingMap: {
        [key: string]: boolean | undefined
    }
    isFilterDirty: boolean
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

export enum TableColumn {
    AgentName = 'agent_name',
    CustomerSatisfaction = 'customer_satisfaction',
    FirstResponseTime = 'first_response_time',
    ResolutionTime = 'resolution_time',
    MessagesSent = 'messages_sent',
    PercentageOfClosedTickets = 'percentage_of_closed_tickets',
    ClosedTickets = 'closed_tickets',
    RepliedTickets = 'replied_tickets',
}
