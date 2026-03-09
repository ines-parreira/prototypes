import type { ComponentProps } from 'react'
import React from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import AgentsFilter from 'domains/reporting/pages/common/filters/AgentsFilter'
import { extendedAgents } from 'domains/reporting/pages/common/filters/tests/fixtures/agents'
import { extendedTeams } from 'domains/reporting/pages/common/filters/tests/fixtures/teams'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import type { RootState } from 'state/types'

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
    title: 'Stats/Filters/AgentsFilter',
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
