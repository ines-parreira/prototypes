import { ComponentType } from 'react'

import { FilterComponentKey, FilterKey } from 'models/stat/types'
import {
    AccuracyFilterWithSavedState,
    AccuracyFilterWithState,
} from 'pages/stats/common/filters/AccuracyFilter'
import {
    AgentsFiltersWithSavedState,
    AgentsFiltersWithState,
} from 'pages/stats/common/filters/AgentsFilter'
import { AggregationWindowFilterWithState } from 'pages/stats/common/filters/AggregationWindowFilter'
import {
    BrandVoiceFilterWithSavedState,
    BrandVoiceFilterWithState,
} from 'pages/stats/common/filters/BrandVoiceFilter'
import { BusiestTimesMetricSelectFilter } from 'pages/stats/common/filters/BusiestTimesMetricSelectFilter'
import {
    CampaignsFilterFromContext,
    CampaignsFilterFromSavedContext,
} from 'pages/stats/common/filters/CampaignsFilter'
import {
    ChannelsFilterWithSavedState,
    ChannelsFilterWithState,
} from 'pages/stats/common/filters/ChannelsFilter'
import {
    CommunicationSkillsFilterWithSavedState,
    CommunicationSkillsFilterWithState,
} from 'pages/stats/common/filters/CommunicationSkillsFilter'
import { CustomFieldFilter } from 'pages/stats/common/filters/CustomFieldFilter'
import {
    CustomFieldsFilterWithSavedState,
    CustomFieldsFilterWithState,
} from 'pages/stats/common/filters/CustomFieldsFilter'
import {
    EfficiencyFilterWithSavedState,
    EfficiencyFilterWithState,
} from 'pages/stats/common/filters/EfficiencyFilter'
import { HelpCenterFilterWithState } from 'pages/stats/common/filters/HelpCenterFilter'
import { HelpCenterLanguageFilterWithState } from 'pages/stats/common/filters/HelpCenterLanguageFilter'
import {
    IntegrationsFilterWithSavedState,
    IntegrationsFilterWithState,
    PhoneIntegrationsFilterWithState,
} from 'pages/stats/common/filters/IntegrationsFilter'
import {
    InternalComplianceFilterWithSavedState,
    InternalComplianceFilterWithState,
} from 'pages/stats/common/filters/InternalComplianceFilter'
import {
    LanguageProficiencyFilterWithSavedState,
    LanguageProficiencyFilterWithState,
} from 'pages/stats/common/filters/LanguageProficiencyFilter'
import { PeriodFilterWithState } from 'pages/stats/common/filters/PeriodFilter'
import {
    ResolutionCompletenessFilterWithSavedState,
    ResolutionCompletenessFilterWithState,
} from 'pages/stats/common/filters/ResolutionCompletenessFilter'
import {
    ScoreFiltersWithSavedState,
    ScoreFiltersWithState,
} from 'pages/stats/common/filters/ScoreFilter'
import { SLAPolicyFilterWithState } from 'pages/stats/common/filters/SLAPolicyFilter'
import { StoreFilterFromContext } from 'pages/stats/common/filters/StoreFilter'
import {
    TagsFilterWithSavedState,
    TagsFilterWithState,
} from 'pages/stats/common/filters/TagsFilter'
import {
    CampaignStatusesFilterFromContext,
    CampaignStatusesFilterFromSavedContext,
} from 'pages/stats/convert/components/CampaignStatusesFilter/CampaignStatusesFilter'

import { VoiceQueuesFilterWithState } from './VoiceQueuesFilter'

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
    [FilterKey.Campaigns]: CampaignsFilterFromContext,
    [FilterKey.CampaignStatuses]: CampaignStatusesFilterFromContext,
    [FilterKey.Channels]: ChannelsFilterWithState,
    [FilterKey.CommunicationSkills]: CommunicationSkillsFilterWithState,
    [FilterKey.CustomFields]: CustomFieldsFilterWithState,
    [FilterKey.Efficiency]: EfficiencyFilterWithState,
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
    [FilterKey.Tags]: TagsFilterWithState,
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
    [FilterKey.InternalCompliance]: InternalComplianceFilterWithSavedState,
    [FilterKey.BrandVoice]: BrandVoiceFilterWithSavedState,
    [FilterKey.ResolutionCompleteness]:
        ResolutionCompletenessFilterWithSavedState,
    [FilterKey.Score]: ScoreFiltersWithSavedState,
    [FilterKey.Tags]: TagsFilterWithSavedState,
    [FilterKey.AggregationWindow]: () => null,
    [FilterKey.HelpCenters]: () => null,
    [FilterKey.LocaleCodes]: () => null,
    [FilterKey.Period]: () => null,
    [FilterKey.SlaPolicies]: () => null,
    [FilterKey.StoreIntegrations]: () => null,
    [FilterKey.VoiceQueues]: () => null,
    [FilterComponentKey.BusiestTimesMetricSelectFilter]: () => null,
    [FilterComponentKey.CustomField]: () => null,
    [FilterComponentKey.PhoneIntegrations]: () => null,
}
