import React, { ComponentProps } from 'react'

import { Meta, StoryFn } from '@storybook/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { withLogicalOperator } from 'models/reporting/queryFactories/utils'
import { EfficiencyFilter } from 'pages/stats/common/filters//EfficiencyFilter'

const storyConfig: Meta = {
    title: 'Stats/Filters/EfficiencyFilter',
    component: EfficiencyFilter,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const defaultState = {}

const store = configureMockStore([thunk])(defaultState)

const Template: StoryFn<ComponentProps<typeof EfficiencyFilter>> = (props) => {
    return (
        <Provider store={store}>
            <EfficiencyFilter {...props} />
        </Provider>
    )
}

export const Default = Template.bind({})

Default.args = {
    value: withLogicalOperator([]),
}

export default storyConfig
