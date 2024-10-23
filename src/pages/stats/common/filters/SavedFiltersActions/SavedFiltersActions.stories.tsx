import {QueryClientProvider} from '@tanstack/react-query'
import {Meta, StoryFn} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'

import {SavedFiltersActions} from 'pages/stats/common/filters/SavedFiltersActions/SavedFiltersActions'
import {appQueryClient} from 'api/queryClient'
import {FilterKey} from 'models/stat/types'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {initialState} from 'state/stats/statsSlice'
import {activeParams} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {customFieldDefinitionKeys} from 'custom-fields/hooks/queries/queries'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {RootState} from 'state/types'
import {integrationsState} from 'fixtures/integrations'
import {customFieldsMockResponse} from 'fixtures/customField'
import {UserRole} from 'config/types/user'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'

const defaultState = {
    stats: {
        filters: {
            ...initialState.filters,
            [FilterKey.Channels]: withDefaultLogicalOperator([123]),
        },
    },
    ui: uiStatsInitialState,
    integrations: fromJS(integrationsState),
    currentUser: fromJS({role: {name: UserRole.Admin}}),
} as unknown as RootState

const storyConfig: Meta = {
    title: 'Common/Filters/SavedFiltersActions',
    component: FiltersPanel,
}

const FiltersPanelWithSavedFilters: StoryFn<
    ComponentProps<typeof SavedFiltersActions>
> = (props) => {
    appQueryClient.setQueryData(customFieldDefinitionKeys.list(activeParams), {
        data: customFieldsMockResponse,
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
    persistentFilters: [FilterKey.Period],
    optionalFilters: [
        FilterKey.Integrations,
        FilterKey.Channels,
        FilterKey.Agents,
    ],
    savedFilters: [
        {id: 1, name: 'Temp Filter 1'},
        {id: 2, name: 'Temp Filter 2'},
    ],
    onSaveFilters: () => {},
}

export default storyConfig
