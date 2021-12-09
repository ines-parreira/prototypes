import {Map} from 'immutable'

import {TicketChannel} from '../../business/types/ticket'

export type StatsState = Map<any, any>

export enum StatsFilterType {
    Channels = 'channels',
    Agents = 'agents',
    Integrations = 'integrations',
    Tags = 'tags',
    Period = 'period',
    Score = 'score',
}

export type IntegrationsStatsFilterValue = number[]

export type PeriodStatsFilterValue = {
    end_datetime: string
    start_datetime: string
}

export type TagsStatsFilterValue = number[]

export type AgentsStatsFilterValue = number[]

export type ChannelsStatsFilterValue = TicketChannel[]

export type ScoreStatsFilterValue = string[]

export type StatsFilters = {
    [StatsFilterType.Period]: PeriodStatsFilterValue
    [StatsFilterType.Integrations]?: IntegrationsStatsFilterValue
    [StatsFilterType.Tags]?: TagsStatsFilterValue
    [StatsFilterType.Agents]?: AgentsStatsFilterValue
    [StatsFilterType.Channels]?: ChannelsStatsFilterValue
    [StatsFilterType.Score]?: ScoreStatsFilterValue
}
