import {Meta, StoryFn} from '@storybook/react'
import {QueryClientProvider} from '@tanstack/react-query'
import React, {ComponentProps} from 'react'

import {MemoryRouter} from 'react-router-dom'

import {appQueryClient} from 'api/queryClient'

import {AiAgentOverview} from './AiAgentOverview'

const storyConfig: Meta<typeof AiAgentOverview> = {
    title: 'AI Agent/Overview',
    component: AiAgentOverview,
    decorators: [
        (Story) => (
            <QueryClientProvider client={appQueryClient}>
                <MemoryRouter initialEntries={['/']}>
                    <Story />
                </MemoryRouter>
            </QueryClientProvider>
        ),
    ],
}

const Template: StoryFn<ComponentProps<typeof AiAgentOverview>> = () => {
    return <AiAgentOverview />
}

export const Default = Template.bind({})
Default.args = {}

export default storyConfig
