import {Meta, StoryFn} from '@storybook/react'
import {QueryClientProvider} from '@tanstack/react-query'
import React, {ComponentProps} from 'react'

import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {appQueryClient} from 'api/queryClient'

import {AiAgentOverview} from './AiAgentOverview'
import {AiAgentOverviewRootStateFixture} from './tests/AiAgentOverviewRootState.fixture'

const rootState = AiAgentOverviewRootStateFixture.start()
    .with2ShopifyIntegrations()
    .build()

const storyConfig: Meta<typeof AiAgentOverview> = {
    title: 'AI Agent/Overview',
    component: AiAgentOverview,
    decorators: [
        (Story) => (
            <Provider store={configureMockStore()(rootState)}>
                <QueryClientProvider client={appQueryClient}>
                    <MemoryRouter initialEntries={['/']}>
                        <Story />
                    </MemoryRouter>
                </QueryClientProvider>
            </Provider>
        ),
    ],
}

const Template: StoryFn<ComponentProps<typeof AiAgentOverview>> = () => {
    return <AiAgentOverview />
}

export const Default = Template.bind({})
Default.args = {}

export default storyConfig
