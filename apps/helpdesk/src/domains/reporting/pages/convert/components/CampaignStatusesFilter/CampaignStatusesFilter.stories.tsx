import type { ComponentProps } from 'react'
import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import CampaignStatusesFilter from 'domains/reporting/pages/convert/components/CampaignStatusesFilter/index'

const storyConfig: Meta = {
    title: 'Stats/Filters/CampaignStatusesFilter',
    component: CampaignStatusesFilter,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const defaultState = {}

const store = configureMockStore([thunk])(defaultState)

const Template: StoryFn<ComponentProps<typeof CampaignStatusesFilter>> = (
    props,
) => {
    return (
        <Provider store={store}>
            <CampaignStatusesFilter {...props} />
        </Provider>
    )
}

export const Default = Template.bind({})

Default.args = {
    value: withLogicalOperator([]),
}

export default storyConfig
