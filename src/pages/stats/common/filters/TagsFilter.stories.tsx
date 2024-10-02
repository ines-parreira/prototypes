import React, {ComponentProps} from 'react'
import {Meta, StoryFn} from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {TagFilterInstanceId} from 'models/stat/types'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {tags} from 'fixtures/tag'
import {TagsFilter} from 'pages/stats/common/filters/TagsFilter'

const defaultState = {}

const storyConfig: Meta = {
    title: 'Common/Filters/TagsFilter',
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
