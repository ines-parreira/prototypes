import React from 'react'

import { Meta, StoryFn, StoryObj } from '@storybook/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { appQueryClient } from 'api/queryClient'

import KnowledgePreview from './KnowledgePreview'

const storyConfig: Meta<typeof KnowledgePreview> = {
    title: 'AI Agent/Onboarding/KnowledgePreview',
    component: KnowledgePreview,
}

type Story = StoryObj<typeof KnowledgePreview>

const Template: StoryFn<typeof KnowledgePreview> = () => (
    <QueryClientProvider client={appQueryClient}>
        <KnowledgePreview />
    </QueryClientProvider>
)

export const Primary: Story = Template.bind({})

export default storyConfig
