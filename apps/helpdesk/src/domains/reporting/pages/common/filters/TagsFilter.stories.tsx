import type { ComponentProps } from 'react'
import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { TagsFilter } from 'domains/reporting/pages/common/filters/TagsFilter'
import { tags } from 'fixtures/tag'

const defaultState = {}

const storyConfig: Meta = {
    title: 'Stats/Filters/TagsFilter',
    component: TagsFilter,
}

const Template: StoryFn<ComponentProps<typeof TagsFilter>> = (props) => {
    return (
        <Provider store={configureMockStore([thunk])(defaultState)}>
            <TagsFilter {...props} />
        </Provider>
    )
}

export const Default = Template.bind({})
Default.args = {
    value: {
        ...withDefaultLogicalOperator(tags.map((tag) => tag.id)),
        filterInstanceId: TagFilterInstanceId.First,
    },
}

export default storyConfig
