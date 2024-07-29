import {Meta, StoryFn} from '@storybook/react'
import {fromJS} from 'immutable'

import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {integrationsState} from 'fixtures/integrations'
import {FilterKey} from 'models/stat/types'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {initialState, statsSlice} from 'state/stats/statsSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'

const defaultState = {
    [statsSlice.name]: initialState,
    ui: {
        stats: uiStatsInitialState,
    },
    integrations: fromJS(integrationsState),
}

const storyConfig: Meta = {
    title: 'Common/Filters/FiltersPanel',
    component: FiltersPanel,
}

const Template: StoryFn<ComponentProps<typeof FiltersPanel>> = (props) => {
    return (
        <Provider store={configureMockStore([thunk])(defaultState)}>
            <FiltersPanel {...props} />
        </Provider>
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
