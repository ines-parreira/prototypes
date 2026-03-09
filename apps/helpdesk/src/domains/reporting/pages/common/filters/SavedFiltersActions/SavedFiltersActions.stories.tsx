import type { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
import { UserRole } from 'config/types/user'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanel } from 'domains/reporting/pages/common/filters/FiltersPanel'
import { SavedFiltersActions } from 'domains/reporting/pages/common/filters/SavedFiltersActions/SavedFiltersActions'
import { activeParams } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { customFieldsMockResponse } from 'fixtures/customField'
import { integrationsState } from 'fixtures/integrations'
import type { RootState } from 'state/types'

const defaultState = {
    stats: {
        filters: {
            ...initialState.filters,
            [FilterKey.Channels]: withDefaultLogicalOperator([123]),
        },
    },
    ui: uiStatsInitialState,
    integrations: fromJS(integrationsState),
    currentUser: fromJS({ role: { name: UserRole.Admin } }),
} as unknown as RootState

const storyConfig: Meta = {
    title: 'Stats/Filters/SavedFiltersActions',
    component: FiltersPanel,
}

const FiltersPanelWithSavedFilters: StoryFn<
    ComponentProps<typeof SavedFiltersActions>
> = (props) => {
    appQueryClient.setQueryData(
        queryKeys.customFields.listCustomFields(activeParams),
        {
            data: customFieldsMockResponse,
        },
    )
    appQueryClient.setQueryData(['savedFilters', 'listAnalyticsFilters'], {
        data: [
            { id: 1, name: 'Temp Filter 1', filter_group: [] },
            { id: 2, name: 'Temp Filter 2', filter_group: [] },
        ],
    })
    return (
        <QueryClientProvider client={appQueryClient}>
            <Provider store={configureMockStore([thunk])(defaultState)}>
                <SavedFiltersActions {...props} />
            </Provider>
        </QueryClientProvider>
    )
}

export const Default = FiltersPanelWithSavedFilters.bind({})

Default.args = {
    optionalFilters: [
        FilterKey.Integrations,
        FilterKey.Channels,
        FilterKey.Agents,
    ],
}

export default storyConfig
