import React, {ComponentProps} from 'react'
import {Meta, StoryFn} from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {fromJS} from 'immutable'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {initialState} from 'state/stats/statsSlice'

import {RootState} from 'state/types'
import AgentsFilter from './AgentsFilter'
import {extendedAgents} from './tests/fixtures/agents'
import {extendedTeams} from './tests/fixtures/teams'

const defaultState = {
    stats: initialState,
    agents: fromJS({
        all: extendedAgents,
    }),
    teams: fromJS({
        all: extendedTeams,
    }),
} as RootState

const storyConfig: Meta = {
    title: 'Common/Filters/AgentsFilter',
    component: AgentsFilter,
}

const Template: StoryFn<ComponentProps<typeof AgentsFilter>> = (props) => {
    return (
        <Provider store={configureMockStore([thunk])(defaultState)}>
            <AgentsFilter {...props} />
        </Provider>
    )
}

export const Default = Template.bind({})
Default.args = {
    value: withDefaultLogicalOperator(extendedAgents.map((agent) => agent.id)),
}

export default storyConfig
