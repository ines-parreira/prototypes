import React from 'react'

import {Meta, StoryObj} from '@storybook/react'
import {action} from '@storybook/addon-actions'

import {
    TopQuestionCard as TopQuestionCardComponent,
    TopQuestionCardLoading as TopQuestionCardLoadingComponent,
} from './TopQuestionCard'

const meta: Meta<typeof TopQuestionCardComponent> = {
    component: TopQuestionCardComponent,
    title: 'Automate/TopQuestions/TopQuestionCard',
    args: {
        title: 'How can I ensure my apartment number is included on the shipping label?',
        ticketsCount: 439,
    },
}

export default meta
type Story = StoryObj<typeof TopQuestionCardComponent>

export const TopQuestionCard: Story = {
    render: (args) => (
        <TopQuestionCardComponent
            {...args}
            onDismiss={action('onDismiss')}
            onCreateArticle={action('onCreateArticle')}
        />
    ),
}

export const TopQuestionCardLoading: StoryObj<
    typeof TopQuestionCardLoadingComponent
> = {
    render: () => <TopQuestionCardLoadingComponent />,
}
