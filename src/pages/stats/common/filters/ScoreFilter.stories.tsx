import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Meta, StoryFn} from '@storybook/react'

import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {ScoreFilter} from './ScoreFilter'

const storyConfig: Meta = {
    title: 'Common/Filters/ScoreFilter',
    component: ScoreFilter,
    parameters: {
        chromatic: {disableSnapshot: false},
    },
}

const defaultState = {}

const store = configureMockStore([thunk])(defaultState)

const Template: StoryFn<ComponentProps<typeof ScoreFilter>> = (props) => {
    return (
        <Provider store={store}>
            <ScoreFilter {...props} />
        </Provider>
    )
}

export const Default = Template.bind({})

Default.args = {
    value: withLogicalOperator([]),
}

export default storyConfig
