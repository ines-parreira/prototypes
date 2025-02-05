import {Meta, StoryFn} from '@storybook/react'
import React, {ComponentProps} from 'react'

import {MemoryRouter} from 'react-router-dom'

import {AiAgentOverview} from './AiAgentOverview'

const storyConfig: Meta<typeof AiAgentOverview> = {
    title: 'AI Agent/Overview',
    component: AiAgentOverview,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={['/']}>
                <Story />
            </MemoryRouter>
        ),
    ],
}

const Template: StoryFn<ComponentProps<typeof AiAgentOverview>> = () => {
    return <AiAgentOverview />
}

export const Default = Template.bind({})
Default.args = {}

export default storyConfig
