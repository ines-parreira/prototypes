import type { ComponentProps } from 'react'
import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { appQueryClient } from 'api/queryClient'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { ChannelsFilter } from 'domains/reporting/pages/common/filters/ChannelsFilter'
import { channels } from 'fixtures/channels'
import { channelsQueryKeys } from 'models/channel/queries'

const defaultState = {}

const storyConfig: Meta = {
    title: 'Stats/Filters/ChannelsFilter',
    component: ChannelsFilter,
}

const Template: StoryFn<ComponentProps<typeof ChannelsFilter>> = (props) => {
    appQueryClient.setQueryData(channelsQueryKeys.list(), { data: channels })
    return (
        <QueryClientProvider client={appQueryClient}>
            <Provider store={configureMockStore([thunk])(defaultState)}>
                <ChannelsFilter {...props} />
            </Provider>
        </QueryClientProvider>
    )
}

export const Default = Template.bind({})
Default.args = {
    value: withDefaultLogicalOperator(channels.map((channel) => channel.slug)),
}

export default storyConfig
