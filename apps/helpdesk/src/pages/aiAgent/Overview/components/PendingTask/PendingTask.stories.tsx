import type { ComponentProps } from 'react'
import React from 'react'

import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { PendingTask } from './PendingTask'

const storyConfig: Meta<typeof PendingTask> = {
    title: 'AI Agent/Overview/PendingTask',
    component: PendingTask,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={['/']}>
                <Story />
            </MemoryRouter>
        ),
    ],
}

const Template: StoryFn<ComponentProps<typeof PendingTask>> = (args) => {
    args.ctaUrl = '/'

    return (
        <div style={{ width: '300px' }}>
            <PendingTask {...args} />
        </div>
    )
}

export const Default = Template.bind({})
Default.args = {
    title: 'Enable Email Channel',
    caption: 'Automate reponses when customers email.',
    type: 'BASIC',
}

export const IsLoading = Template.bind({})
IsLoading.args = {
    title: 'Enable Email Channel',
    caption: 'Automate reponses when customers email.',
    type: 'BASIC',
    isLoading: true,
}

export const TwoLinesText = Template.bind({})
TwoLinesText.args = {
    title: 'Give feedback in 5 tickets',
    caption:
        'Automate responses when customers email you. Automate responses when customers.',
    type: 'BASIC',
}

export const LongText = Template.bind({})
LongText.args = {
    title: 'Review your AI Generated Guidance',
    caption:
        'Automate reponses when customers email you. More content that will wrap so beware of making stuff long. Automate reponses when customers email you. More content that will wrap so beware of making stuff long.',
    type: 'BASIC',
}

export const TypeRecommended = Template.bind({})
TypeRecommended.args = {
    title: 'Review your AI Generated Guidance',
    caption:
        'Automate reponses when customers email you. More content that will wrap so beware of making stuff long. Automate reponses when customers email you. More content that will wrap so beware of making stuff long.',
    type: 'RECOMMENDED',
}

export default storyConfig
