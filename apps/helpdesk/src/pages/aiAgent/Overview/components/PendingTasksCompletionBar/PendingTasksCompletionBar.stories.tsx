import type { ComponentProps } from 'react'
import React from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { PendingTasksCompletionBar } from './PendingTasksCompletionBar'

const storyConfig: Meta<typeof PendingTasksCompletionBar> = {
    title: 'AI Agent/Overview/PendingTasksCompletionBar',
    component: PendingTasksCompletionBar,
}

const Template: StoryFn<ComponentProps<typeof PendingTasksCompletionBar>> = (
    args,
) => {
    return <PendingTasksCompletionBar {...args} />
}

export const Default = Template.bind({})
Default.args = { totalTasks: 10, totalTasksCompleted: 5 }

export const Loading = Template.bind({})
Loading.args = { isLoading: true }

export const _100Percent = Template.bind({})
_100Percent.args = { totalTasks: 10, totalTasksCompleted: 10 }

export const _25Percent = Template.bind({})
_25Percent.args = { totalTasks: 20, totalTasksCompleted: 5 }

export default storyConfig
