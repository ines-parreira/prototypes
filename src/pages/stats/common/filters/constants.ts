import {ReportingGranularity} from 'models/reporting/types'
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

export const FilterLabels: Record<FilterKey | FilterComponentKey, string> = {
    [FilterKey.Period]: 'Date',
    [FilterKey.AggregationWindow]: 'Aggregation',
    [FilterKey.Integrations]: 'Integration',
    [FilterKey.Tags]: 'Tag',
    [FilterKey.Agents]: 'Agent',
    [FilterKey.HelpCenters]: 'Report on',
    [FilterKey.LocaleCodes]: 'Language',
    [FilterKey.Channels]: 'Channel',
    [FilterKey.Campaigns]: 'Campaign',
    [FilterKey.CampaignStatuses]: 'Campaign Status',
    [FilterKey.CustomFields]: 'Custom Field',
    [FilterKey.Score]: 'Satisfaction score',
    [FilterKey.SlaPolicies]: 'Report on',
    [FilterKey.CommunicationSkills]: 'Communication skill',
    [FilterKey.ResolutionCompleteness]: 'Resolution completeness',
    [FilterComponentKey.BusiestTimesMetricSelectFilter]: 'Report on',
    [FilterComponentKey.CustomField]: 'Report on',
    [FilterComponentKey.Store]: 'Report on',
    [FilterComponentKey.PhoneIntegrations]: 'Integration',
}
export const ReportingGranularityLabels: Record<ReportingGranularity, string> =
    {
        [ReportingGranularity.Year]: 'Year',
        [ReportingGranularity.Quarter]: 'Quarter',
        [ReportingGranularity.Month]: 'Month',
        [ReportingGranularity.Week]: 'Week',
        [ReportingGranularity.Day]: 'Day',
        [ReportingGranularity.Hour]: 'Hour',
        [ReportingGranularity.Minute]: 'Minute',
        [ReportingGranularity.Second]: 'Second',
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

export const scoreFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const communicationSkillsFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const resolutionCompletenessFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]
