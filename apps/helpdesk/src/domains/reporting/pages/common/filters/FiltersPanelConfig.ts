import type { ComponentType } from 'react'

import {
    FilterComponentKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import {
    AccuracyFilterWithSavedState,
    AccuracyFilterWithState,
} from 'domains/reporting/pages/common/filters/AccuracyFilter'
import {
    AgentsFiltersWithSavedState,
    AgentsFiltersWithState,
} from 'domains/reporting/pages/common/filters/AgentsFilter'
import { AggregationWindowFilterWithState } from 'domains/reporting/pages/common/filters/AggregationWindowFilter'
import {
    AssignedTeamFilterWithSavedState,
    AssignedTeamFilterWithState,
} from 'domains/reporting/pages/common/filters/AssignedTeamFilter'
import {
    BrandVoiceFilterWithSavedState,
    BrandVoiceFilterWithState,
} from 'domains/reporting/pages/common/filters/BrandVoiceFilter'
import { BusiestTimesMetricSelectFilter } from 'domains/reporting/pages/common/filters/BusiestTimesMetricSelectFilter'
import {
    CampaignsFilterFromContext,
    CampaignsFilterFromSavedContext,
} from 'domains/reporting/pages/common/filters/CampaignsFilter'
import {
    ChannelsFilterWithSavedState,
    ChannelsFilterWithState,
} from 'domains/reporting/pages/common/filters/ChannelsFilter'
import {
    CommunicationSkillsFilterWithSavedState,
    CommunicationSkillsFilterWithState,
} from 'domains/reporting/pages/common/filters/CommunicationSkillsFilter'
import { CustomFieldFilter } from 'domains/reporting/pages/common/filters/CustomFieldFilter'
import {
    CustomFieldsFilterWithSavedState,
    CustomFieldsFilterWithState,
} from 'domains/reporting/pages/common/filters/CustomFieldsFilter'
import {
    DuringBusinessHoursFilterWithSavedState,
    DuringBusinessHoursFilterWithState,
} from 'domains/reporting/pages/common/filters/DuringBusinessHoursFilter'
import {
    EfficiencyFilterWithSavedState,
    EfficiencyFilterWithState,
} from 'domains/reporting/pages/common/filters/EfficiencyFilter'
import {
    HandoverFilterFromContext,
    HandoverFilterFromSavedContext,
} from 'domains/reporting/pages/common/filters/HandoverFilter'
import { HelpCenterFilterWithState } from 'domains/reporting/pages/common/filters/HelpCenterFilter'
import { HelpCenterLanguageFilterWithState } from 'domains/reporting/pages/common/filters/HelpCenterLanguageFilter'
import {
    IntegrationsFilterWithSavedState,
    IntegrationsFilterWithState,
    PhoneIntegrationsFilterWithState,
} from 'domains/reporting/pages/common/filters/IntegrationsFilter'
import {
    InternalComplianceFilterWithSavedState,
    InternalComplianceFilterWithState,
} from 'domains/reporting/pages/common/filters/InternalComplianceFilter'
import {
    JourneyCampaignsFilterFromContext,
    JourneyCampaignsFilterFromSavedContext,
} from 'domains/reporting/pages/common/filters/JourneyCampaignsFilter'
import {
    JourneyFlowsFilterFromContext,
    JourneyFlowsFilterFromSavedContext,
} from 'domains/reporting/pages/common/filters/JourneyFlowsFilter'
import { JourneysFilterWithState } from 'domains/reporting/pages/common/filters/JourneyTypeFilter'
import {
    LanguageProficiencyFilterWithSavedState,
    LanguageProficiencyFilterWithState,
} from 'domains/reporting/pages/common/filters/LanguageProficiencyFilter'
import {
    MultiStoreFilterWithSavedState,
    MultiStoreFilterWithState,
} from 'domains/reporting/pages/common/filters/MultiStoreFilter'
import { PeriodFilterWithState } from 'domains/reporting/pages/common/filters/PeriodFilter'
import {
    ResolutionCompletenessFilterWithSavedState,
    ResolutionCompletenessFilterWithState,
} from 'domains/reporting/pages/common/filters/ResolutionCompletenessFilter'
import {
    ScoreFiltersWithSavedState,
    ScoreFiltersWithState,
} from 'domains/reporting/pages/common/filters/ScoreFilter'
import { SLAPolicyFilterWithState } from 'domains/reporting/pages/common/filters/SLAPolicyFilter'
import { StoreFilterFromContext } from 'domains/reporting/pages/common/filters/StoreFilter'
import {
    TagsFilterWithSavedState,
    TagsFilterWithState,
} from 'domains/reporting/pages/common/filters/TagsFilter'
import {
    VoiceQueuesFilterWithSavedState,
    VoiceQueuesFilterWithState,
} from 'domains/reporting/pages/common/filters/VoiceQueuesFilter'
import {
    CampaignStatusesFilterFromContext,
    CampaignStatusesFilterFromSavedContext,
} from 'domains/reporting/pages/convert/components/CampaignStatusesFilter/CampaignStatusesFilter'

export const FilterComponentMap: Record<
    FilterKey | FilterComponentKey,
    ComponentType<any>
> = {
    [FilterComponentKey.BusiestTimesMetricSelectFilter]:
        BusiestTimesMetricSelectFilter,
    [FilterComponentKey.CustomField]: CustomFieldFilter,
    [FilterComponentKey.PhoneIntegrations]: PhoneIntegrationsFilterWithState,
    [FilterKey.Accuracy]: AccuracyFilterWithState,
    [FilterKey.Agents]: AgentsFiltersWithState,
    [FilterKey.AggregationWindow]: AggregationWindowFilterWithState,
    [FilterKey.BrandVoice]: BrandVoiceFilterWithState,
    [FilterKey.IsDuringBusinessHours]: DuringBusinessHoursFilterWithState,
    [FilterKey.Campaigns]: CampaignsFilterFromContext,
    [FilterKey.CampaignStatuses]: CampaignStatusesFilterFromContext,
    [FilterKey.Channels]: ChannelsFilterWithState,
    [FilterKey.JourneyType]: JourneysFilterWithState,
    [FilterKey.JourneyFlows]: JourneyFlowsFilterFromContext,
    [FilterKey.JourneyCampaigns]: JourneyCampaignsFilterFromContext,
    [FilterKey.CommunicationSkills]: CommunicationSkillsFilterWithState,
    [FilterKey.CustomFields]: CustomFieldsFilterWithState,
    [FilterKey.Efficiency]: EfficiencyFilterWithState,
    [FilterKey.Handover]: HandoverFilterFromContext,
    [FilterKey.HelpCenters]: HelpCenterFilterWithState,
    [FilterKey.Integrations]: IntegrationsFilterWithState,
    [FilterKey.InternalCompliance]: InternalComplianceFilterWithState,
    [FilterKey.LanguageProficiency]: LanguageProficiencyFilterWithState,
    [FilterKey.LocaleCodes]: HelpCenterLanguageFilterWithState,
    [FilterKey.Period]: PeriodFilterWithState,
    [FilterKey.ResolutionCompleteness]: ResolutionCompletenessFilterWithState,
    [FilterKey.Score]: ScoreFiltersWithState,
    [FilterKey.SlaPolicies]: SLAPolicyFilterWithState,
    [FilterKey.StoreIntegrations]: StoreFilterFromContext,
    [FilterKey.Stores]: MultiStoreFilterWithState,
    [FilterKey.Tags]: TagsFilterWithState,
    [FilterKey.AssignedTeam]: AssignedTeamFilterWithState,
    [FilterKey.VoiceQueues]: VoiceQueuesFilterWithState,
}

export const SavedFilterComponentMap: Record<
    FilterKey | FilterComponentKey,
    ComponentType<any>
> = {
    [FilterKey.Agents]: AgentsFiltersWithSavedState,
    [FilterKey.Campaigns]: CampaignsFilterFromSavedContext,
    [FilterKey.CampaignStatuses]: CampaignStatusesFilterFromSavedContext,
    [FilterKey.Channels]: ChannelsFilterWithSavedState,
    [FilterKey.CommunicationSkills]: CommunicationSkillsFilterWithSavedState,
    [FilterKey.CustomFields]: CustomFieldsFilterWithSavedState,
    [FilterKey.Integrations]: IntegrationsFilterWithSavedState,
    [FilterKey.LanguageProficiency]: LanguageProficiencyFilterWithSavedState,
    [FilterKey.Accuracy]: AccuracyFilterWithSavedState,
    [FilterKey.Efficiency]: EfficiencyFilterWithSavedState,
    [FilterKey.Handover]: HandoverFilterFromSavedContext,
    [FilterKey.InternalCompliance]: InternalComplianceFilterWithSavedState,
    [FilterKey.BrandVoice]: BrandVoiceFilterWithSavedState,
    [FilterKey.IsDuringBusinessHours]: DuringBusinessHoursFilterWithSavedState,
    [FilterKey.ResolutionCompleteness]:
        ResolutionCompletenessFilterWithSavedState,
    [FilterKey.Score]: ScoreFiltersWithSavedState,
    [FilterKey.Tags]: TagsFilterWithSavedState,
    [FilterKey.AggregationWindow]: () => null,
    [FilterKey.JourneyType]: () => null,
    [FilterKey.JourneyFlows]: JourneyFlowsFilterFromSavedContext,
    [FilterKey.JourneyCampaigns]: JourneyCampaignsFilterFromSavedContext,
    [FilterKey.HelpCenters]: () => null,
    [FilterKey.LocaleCodes]: () => null,
    [FilterKey.Period]: () => null,
    [FilterKey.SlaPolicies]: () => null,
    [FilterKey.StoreIntegrations]: () => null,
    [FilterKey.Stores]: MultiStoreFilterWithSavedState,
    [FilterKey.AssignedTeam]: AssignedTeamFilterWithSavedState,
    [FilterKey.VoiceQueues]: VoiceQueuesFilterWithSavedState,
    [FilterComponentKey.BusiestTimesMetricSelectFilter]: () => null,
    [FilterComponentKey.CustomField]: () => null,
    [FilterComponentKey.PhoneIntegrations]: () => null,
}
