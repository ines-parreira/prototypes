import {FilterComponentKey, FilterKey} from 'models/stat/types'
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

export const campaignStatusesFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const campaignsFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const FilterLabels: Record<FilterKey | FilterComponentKey, string> = {
    [FilterKey.Period]: 'Date',
    [FilterKey.Integrations]: 'Integration',
    [FilterKey.Tags]: 'Tag',
    [FilterKey.Agents]: 'Agent',
    [FilterKey.HelpCenters]: 'Report on',
    [FilterKey.LocaleCodes]: 'Language',
    [FilterKey.Channels]: 'Channel',
    [FilterKey.Campaigns]: 'Campaign',
    [FilterKey.CampaignStatuses]: 'Campaign Status',
    [FilterKey.CustomFields]: 'Custom Field',
    [FilterKey.Score]: 'Score',
    [FilterKey.SlaPolicies]: 'Sla Policy',
    [FilterComponentKey.BusiestTimesMetricSelectFilter]: 'Report on',
    [FilterComponentKey.CustomField]: 'Report on',
    [FilterComponentKey.Store]: 'Report on',
    [FilterComponentKey.PhoneIntegrations]: 'Integration',
}

export const tagsFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.ALL_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const helpCenterLanguageFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const customFieldsFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]
