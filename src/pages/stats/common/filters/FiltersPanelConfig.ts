import {ComponentType} from 'react'

import {FilterComponentKey, FilterKey} from 'models/stat/types'
import {
    AgentsFiltersWithSavedState,
    AgentsFiltersWithState,
} from 'pages/stats/common/filters/AgentsFilter'
import {AggregationWindowFilterWithState} from 'pages/stats/common/filters/AggregationWindowFilter'
import {BusiestTimesMetricSelectFilter} from 'pages/stats/common/filters/BusiestTimesMetricSelectFilter'
import {
    CampaignsFilterFromContext,
    CampaignsFilterFromSavedContext,
} from 'pages/stats/common/filters/CampaignsFilter'
import {
    ChannelsFilterWithSavedState,
    ChannelsFilterWithState,
} from 'pages/stats/common/filters/ChannelsFilter'
import {CommunicationSkillsFilterWithState} from 'pages/stats/common/filters/CommunicationSkillsFilter'
import {CustomFieldFilter} from 'pages/stats/common/filters/CustomFieldFilter'
import {
    CustomFieldsFilterWithSavedState,
    CustomFieldsFilterWithState,
} from 'pages/stats/common/filters/CustomFieldsFilter'
import {HelpCenterFilterWithState} from 'pages/stats/common/filters/HelpCenterFilter'
import {HelpCenterLanguageFilterWithState} from 'pages/stats/common/filters/HelpCenterLanguageFilter'
import {
    IntegrationsFilterWithSavedState,
    IntegrationsFilterWithState,
    PhoneIntegrationsFilterWithState,
} from 'pages/stats/common/filters/IntegrationsFilter'
import {LanguageProficiencyFilterWithState} from 'pages/stats/common/filters/LanguageProficiencyFilter'
import {PeriodFilterWithState} from 'pages/stats/common/filters/PeriodFilter'
import {ResolutionCompletenessFilterWithState} from 'pages/stats/common/filters/ResolutionCompletenessFilter'
import {
    ScoreFiltersWithSavedState,
    ScoreFiltersWithState,
} from 'pages/stats/common/filters/ScoreFilter'
import {SLAPolicyFilterWithState} from 'pages/stats/common/filters/SLAPolicyFilter'
import {StoreFilterFromContext} from 'pages/stats/common/filters/StoreFilter'
import {
    TagsFilterWithSavedState,
    TagsFilterWithState,
} from 'pages/stats/common/filters/TagsFilter'
import {
    CampaignStatusesFilterFromContext,
    CampaignStatusesFilterFromSavedContext,
} from 'pages/stats/convert/components/CampaignStatusesFilter/CampaignStatusesFilter'

export const FilterComponentMap: Record<
    FilterKey | FilterComponentKey,
    ComponentType<any>
> = {
    [FilterComponentKey.BusiestTimesMetricSelectFilter]:
        BusiestTimesMetricSelectFilter,
    [FilterComponentKey.CustomField]: CustomFieldFilter,
    [FilterComponentKey.PhoneIntegrations]: PhoneIntegrationsFilterWithState,
    [FilterComponentKey.Store]: StoreFilterFromContext,
    [FilterKey.Agents]: AgentsFiltersWithState,
    [FilterKey.AggregationWindow]: AggregationWindowFilterWithState,
    [FilterKey.Campaigns]: CampaignsFilterFromContext,
    [FilterKey.CampaignStatuses]: CampaignStatusesFilterFromContext,
    [FilterKey.Channels]: ChannelsFilterWithState,
    [FilterKey.CommunicationSkills]: CommunicationSkillsFilterWithState,
    [FilterKey.CustomFields]: CustomFieldsFilterWithState,
    [FilterKey.HelpCenters]: HelpCenterFilterWithState,
    [FilterKey.Integrations]: IntegrationsFilterWithState,
    [FilterKey.LanguageProficiency]: LanguageProficiencyFilterWithState,
    [FilterKey.LocaleCodes]: HelpCenterLanguageFilterWithState,
    [FilterKey.Period]: PeriodFilterWithState,
    [FilterKey.ResolutionCompleteness]: ResolutionCompletenessFilterWithState,
    [FilterKey.Score]: ScoreFiltersWithState,
    [FilterKey.SlaPolicies]: SLAPolicyFilterWithState,
    [FilterKey.Tags]: TagsFilterWithState,
}

export const SavedFilterComponentMap: Record<
    FilterKey | FilterComponentKey,
    ComponentType<any>
> = {
    [FilterKey.CustomFields]: CustomFieldsFilterWithSavedState,
    [FilterKey.Channels]: ChannelsFilterWithSavedState,
    [FilterKey.Integrations]: IntegrationsFilterWithSavedState,
    [FilterKey.Agents]: AgentsFiltersWithSavedState,
    [FilterKey.Tags]: TagsFilterWithSavedState,
    [FilterKey.Score]: ScoreFiltersWithSavedState,
    [FilterKey.Campaigns]: CampaignsFilterFromSavedContext,
    [FilterKey.CampaignStatuses]: CampaignStatusesFilterFromSavedContext,
    [FilterKey.AggregationWindow]: () => null,
    [FilterKey.CommunicationSkills]: () => null,
    [FilterKey.HelpCenters]: () => null,
    [FilterKey.LanguageProficiency]: () => null,
    [FilterKey.LocaleCodes]: () => null,
    [FilterKey.Period]: () => null,
    [FilterKey.ResolutionCompleteness]: () => null,
    [FilterKey.SlaPolicies]: () => null,
    [FilterComponentKey.BusiestTimesMetricSelectFilter]: () => null,
    [FilterComponentKey.CustomField]: () => null,
    [FilterComponentKey.PhoneIntegrations]: () => null,
    [FilterComponentKey.Store]: () => null,
}
