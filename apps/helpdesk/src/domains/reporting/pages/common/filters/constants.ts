import {
    FilterComponentKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const channelsFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const integrationsFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const teamsFilterLogicalOperators = [
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
    [FilterKey.IsDuringBusinessHours]: 'Business Hours',
    [FilterKey.Integrations]: 'Integration',
    [FilterKey.Tags]: 'Tag',
    [FilterKey.Agents]: 'Agent',
    [FilterKey.HelpCenters]: 'Help Center',
    [FilterKey.LocaleCodes]: 'Language',
    [FilterKey.Channels]: 'Channel',
    [FilterKey.JourneyType]: 'Type',
    [FilterKey.JourneyFlows]: 'Flows',
    [FilterKey.JourneyCampaigns]: 'Campaigns',
    [FilterKey.Campaigns]: 'Campaign',
    [FilterKey.CampaignStatuses]: 'Campaign Status',
    [FilterKey.CustomFields]: 'Custom Field',
    [FilterKey.Score]: 'Satisfaction score',
    [FilterKey.SlaPolicies]: 'SLA Policy',
    [FilterKey.CommunicationSkills]: 'Communication',
    [FilterKey.LanguageProficiency]: 'Language proficiency',
    [FilterKey.ResolutionCompleteness]: 'Resolution completeness',
    [FilterKey.Accuracy]: 'Accuracy',
    [FilterKey.Efficiency]: 'Efficiency',
    [FilterKey.InternalCompliance]: 'Internal compliance',
    [FilterKey.BrandVoice]: 'Brand voice',
    [FilterKey.StoreIntegrations]: 'Store',
    [FilterKey.Stores]: 'Store',
    [FilterKey.AssignedTeam]: 'Assigned Team',
    [FilterComponentKey.BusiestTimesMetricSelectFilter]: 'Ticket Metric',
    [FilterComponentKey.CustomField]: 'Ticket Field',
    [FilterComponentKey.PhoneIntegrations]: 'Integration',
    [FilterKey.VoiceQueues]: 'Queue',
}
export const ReportingGranularityLabels: Record<ReportingGranularity, string> =
    {
        [ReportingGranularity.Month]: 'Month',
        [ReportingGranularity.Week]: 'Week',
        [ReportingGranularity.Day]: 'Day',
        [ReportingGranularity.Hour]: 'Hour',
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

export const languageProficiencyFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const resolutionCompletenessFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const accuracyFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const efficiencyFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const internalComplianceFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const brandVoiceFilterLogicalOperators = [
    LogicalOperatorEnum.ONE_OF,
    LogicalOperatorEnum.NOT_ONE_OF,
]

export const AUTO_QA_FILTER_KEYS = [
    FilterKey.CommunicationSkills,
    FilterKey.ResolutionCompleteness,
    FilterKey.LanguageProficiency,
    FilterKey.Accuracy,
    FilterKey.BrandVoice,
    FilterKey.Efficiency,
    FilterKey.InternalCompliance,
] as const

export const SAVEABLE_FILTERS: Exclude<FilterKey, FilterKey.Period>[] = [
    FilterKey.CustomFields,
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Agents,
    FilterKey.Tags,
    FilterKey.Score,
    FilterKey.IsDuringBusinessHours,
    FilterKey.AssignedTeam,
    FilterKey.VoiceQueues,
    FilterKey.Stores,
    ...AUTO_QA_FILTER_KEYS,
]
