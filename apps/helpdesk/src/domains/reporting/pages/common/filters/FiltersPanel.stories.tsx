import type { ComponentProps } from 'react'
import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
import { UserRole } from 'config/types/user'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanel } from 'domains/reporting/pages/common/filters/FiltersPanel'
import { activeParams } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { customFieldsMockResponse } from 'fixtures/customField'
import { integrationsState } from 'fixtures/integrations'
import type { RootState } from 'state/types'

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
    appQueryClient.setQueryData(
        queryKeys.customFields.listCustomFields(activeParams),
        {
            data: customFieldsMockResponse,
        },
    )
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
