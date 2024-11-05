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
import {
    CommunicationSkillsFilter,
    CommunicationSkillsFilterWithSavedState,
} from 'pages/stats/common/filters/CommunicationSkillsFilter'
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
import {PeriodFilterWithState} from 'pages/stats/common/filters/PeriodFilter'
import {
    ResolutionCompletenessFilter,
    ResolutionCompletenessFilterWithSavedState,
} from 'pages/stats/common/filters/ResolutionCompletenessFilter'
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
    [FilterKey.Period]: PeriodFilterWithState,
    [FilterKey.CustomFields]: CustomFieldsFilterWithState,
    [FilterKey.Channels]: ChannelsFilterWithState,
    [FilterKey.Integrations]: IntegrationsFilterWithState,
    [FilterComponentKey.PhoneIntegrations]: PhoneIntegrationsFilterWithState,
    [FilterKey.Agents]: AgentsFiltersWithState,
    [FilterKey.Tags]: TagsFilterWithState,
    [FilterKey.HelpCenters]: HelpCenterFilterWithState,
    [FilterKey.LocaleCodes]: HelpCenterLanguageFilterWithState,
    [FilterKey.SlaPolicies]: SLAPolicyFilterWithState,
    [FilterKey.Score]: ScoreFiltersWithState,
    [FilterComponentKey.BusiestTimesMetricSelectFilter]:
        BusiestTimesMetricSelectFilter,
    [FilterComponentKey.CustomField]: CustomFieldFilter,
    [FilterKey.Campaigns]: CampaignsFilterFromContext,
    [FilterKey.CampaignStatuses]: CampaignStatusesFilterFromContext,
    [FilterKey.AggregationWindow]: AggregationWindowFilterWithState,
    [FilterComponentKey.Store]: StoreFilterFromContext,
    [FilterKey.ResolutionCompleteness]: ResolutionCompletenessFilter,
    [FilterKey.CommunicationSkills]: CommunicationSkillsFilter,
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
    [FilterKey.HelpCenters]: () => null,
    [FilterKey.LocaleCodes]: () => null,
    [FilterKey.Period]: () => null,
    [FilterKey.SlaPolicies]: () => null,
    [FilterComponentKey.BusiestTimesMetricSelectFilter]: () => null,
    [FilterComponentKey.CustomField]: () => null,
    [FilterComponentKey.PhoneIntegrations]: () => null,
    [FilterComponentKey.Store]: () => null,
    [FilterKey.ResolutionCompleteness]:
        ResolutionCompletenessFilterWithSavedState,
    [FilterKey.CommunicationSkills]: CommunicationSkillsFilterWithSavedState,
}
