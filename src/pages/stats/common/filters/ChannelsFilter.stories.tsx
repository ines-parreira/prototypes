import {QueryClientProvider} from '@tanstack/react-query'
import React, {ComponentProps} from 'react'
import {Meta, StoryFn} from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {channelsQueryKeys} from 'models/channel/queries'
import {appQueryClient} from 'api/queryClient'

import {channels} from 'fixtures/channels'
import {ChannelsFilter} from 'pages/stats/common/filters/ChannelsFilter'

const defaultState = {}

const storyConfig: Meta = {
    title: 'Common/Filters/ChannelsFilter',
    component: ChannelsFilter,
}

const Template: StoryFn<ComponentProps<typeof ChannelsFilter>> = (props) => {
    appQueryClient.setQueryData(channelsQueryKeys.list(), {data: channels})
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
