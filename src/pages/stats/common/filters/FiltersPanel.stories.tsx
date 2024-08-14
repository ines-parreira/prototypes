import {QueryClientProvider} from '@tanstack/react-query'
import {Meta, StoryFn} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'

import {appQueryClient} from 'api/queryClient'
import {FilterKey} from 'models/stat/types'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {initialState} from 'state/stats/statsSlice'
import {activeParams} from 'pages/stats/CustomFieldSelect'
import {customFieldDefinitionKeys} from 'models/customField/queries'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {RootState} from 'state/types'
import {integrationsState} from 'fixtures/integrations'
import {customFieldsMockReponse} from 'fixtures/customField'

const defaultState = {
    stats: initialState,
    ui: {
        stats: uiStatsInitialState,
    },
    integrations: fromJS(integrationsState),
} as RootState

const storyConfig: Meta = {
    title: 'Common/Filters/FiltersPanel',
    component: FiltersPanel,
}

const Template: StoryFn<ComponentProps<typeof FiltersPanel>> = (props) => {
    appQueryClient.setQueryData(customFieldDefinitionKeys.list(activeParams), {
        data: customFieldsMockReponse,
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
