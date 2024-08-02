import {FilterKey} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

export const channelsFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const integrationsFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const agentsFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const FilterLabels: Record<FilterKey, string> = {
    [FilterKey.Period]: 'Date',
    [FilterKey.Integrations]: 'Integration',
    [FilterKey.Tags]: 'Tag',
    [FilterKey.Agents]: 'Agent',
    [FilterKey.HelpCenters]: 'Help Center',
    [FilterKey.LocaleCodes]: 'Locale Code',
    [FilterKey.Channels]: 'Channel',
    [FilterKey.Campaigns]: 'Campaign',
    [FilterKey.CampaignStatuses]: 'Campaign Status',
    [FilterKey.Score]: 'Score',
    [FilterKey.SlaPolicies]: 'Sla Policy',
}

export const tagsFilterLogicalOperators = [
    LogicalOperatorEnum['ONE_OF'],
    LogicalOperatorEnum['NOT_ONE_OF'],
]

export const helpCenterLanguageFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]
