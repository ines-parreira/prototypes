import type { ComponentProps } from 'react'
import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { BrandVoiceFilter } from 'domains/reporting/pages/common/filters/BrandVoiceFilter'

const storyConfig: Meta = {
    title: 'Stats/Filters/BrandVoiceFilter',
    component: BrandVoiceFilter,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const defaultState = {}

const store = configureMockStore([thunk])(defaultState)

const Template: StoryFn<ComponentProps<typeof BrandVoiceFilter>> = (props) => {
    return (
        <Provider store={store}>
            <BrandVoiceFilter {...props} />
        </Provider>
    )
}

export const Default = Template.bind({})

Default.args = {
    value: withLogicalOperator([]),
}

export default storyConfig
