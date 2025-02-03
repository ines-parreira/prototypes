import {Meta, StoryObj} from '@storybook/react'

import {AiAgentOverview} from './AiAgentOverview'

const storyConfig: Meta<typeof AiAgentOverview> = {
    title: 'AI Agent/Overview',
    component: AiAgentOverview,
}

type Story = StoryObj<typeof AiAgentOverview>

export const Primary: Story = {}

export default storyConfig
