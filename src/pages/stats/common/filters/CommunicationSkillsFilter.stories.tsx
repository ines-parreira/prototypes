import {Meta, StoryFn} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {withLogicalOperator} from 'models/reporting/queryFactories/utils'

import {CommunicationSkillsFilter} from './CommunicationSkillsFilter'

const storyConfig: Meta = {
    title: 'Stats/Filters/CommunicationSkillsFilter',
    component: CommunicationSkillsFilter,
    parameters: {
        chromatic: {disableSnapshot: false},
    },
}

const defaultState = {}

const store = configureMockStore([thunk])(defaultState)

const Template: StoryFn<ComponentProps<typeof CommunicationSkillsFilter>> = (
    props
) => {
    return (
        <Provider store={store}>
            <CommunicationSkillsFilter {...props} />
        </Provider>
    )
}

export const Default = Template.bind({})

Default.args = {
    value: withLogicalOperator([]),
}

export default storyConfig
