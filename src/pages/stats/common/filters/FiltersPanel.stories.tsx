import React, { ComponentProps } from 'react'

import { Meta, StoryFn } from '@storybook/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import { UserRole } from 'config/types/user'
import { customFieldDefinitionKeys } from 'custom-fields/hooks/queries/queries'
import { customFieldsMockResponse } from 'fixtures/customField'
import { integrationsState } from 'fixtures/integrations'
import { FilterKey } from 'models/stat/types'
import { FiltersPanel } from 'pages/stats/common/filters/FiltersPanel'
import { activeParams } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import { initialState } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'

const defaultState = {
    stats: initialState,
    ui: {
        stats: { filters: uiStatsInitialState },
    },
    integrations: fromJS(integrationsState),
    currentUser: fromJS({ role: { name: UserRole.Agent } }),
} as RootState

const storyConfig: Meta = {
    title: 'Stats/Filters/FiltersPanel',
    component: FiltersPanel,
}

const Template: StoryFn<ComponentProps<typeof FiltersPanel>> = (props) => {
    appQueryClient.setQueryData(customFieldDefinitionKeys.list(activeParams), {
        data: customFieldsMockResponse,
    })
    return (
        <QueryClientProvider client={appQueryClient}>
            <Provider store={configureMockStore([thunk])(defaultState)}>
                <FiltersPanel {...props} />
            </Provider>
        </QueryClientProvider>
    )
}

export const Default = Template.bind({})

Default.args = {
    persistentFilters: [FilterKey.Period],
    optionalFilters: [
        FilterKey.Integrations,
        FilterKey.Channels,
        FilterKey.Agents,
    ],
}

export default storyConfig
