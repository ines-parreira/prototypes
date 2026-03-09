import type { ComponentProps } from 'react'
import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { ResolutionCompletenessFilter } from 'domains/reporting/pages/common/filters/ResolutionCompletenessFilter'

const storyConfig: Meta = {
    title: 'Stats/Filters/ResolutionCompletenessFilter',
    component: ResolutionCompletenessFilter,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const defaultState = {}

const store = configureMockStore([thunk])(defaultState)

const Template: StoryFn<ComponentProps<typeof ResolutionCompletenessFilter>> = (
    props,
) => {
    return (
        <Provider store={store}>
            <ResolutionCompletenessFilter {...props} />
        </Provider>
    )
}

export const Default = Template.bind({})

Default.args = {
    value: withLogicalOperator([]),
}

export default storyConfig
