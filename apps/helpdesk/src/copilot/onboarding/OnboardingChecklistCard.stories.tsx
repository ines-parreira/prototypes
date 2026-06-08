import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import type { ChecklistTask } from '@repo/onboarding'
import { OnboardingChecklistCard } from '@repo/onboarding'

const tasks: ChecklistTask[] = [
    { content: 'Review tone of voice and knowledge', status: 'completed' },
    { content: 'Connect e-commerce platform', status: 'completed' },
    { content: 'Configure skills', status: 'completed' },
    { content: 'Connect support channel(s)', status: 'pending' },
]

const meta = {
    title: 'Copilot/Onboarding/OnboardingChecklistCard',
    component: OnboardingChecklistCard,
    parameters: {
        layout: 'centered',
    },
    args: {
        tasks,
        title: 'Get started',
    },
    decorators: [
        (Story) => (
            <div style={{ width: 360 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof OnboardingChecklistCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Collapsed: Story = {
    args: { defaultCollapsed: true },
}

export const JustStarted: Story = {
    args: {
        tasks: tasks.map((task) => ({ ...task, status: 'pending' as const })),
    },
}

export const AllCompleted: Story = {
    args: {
        tasks: tasks.map((task) => ({ ...task, status: 'completed' as const })),
    },
}

export const ManySteps: Story = {
    args: {
        tasks: Array.from({ length: 8 }, (_, index) => ({
            content: `Step ${index + 1}`,
            status: index < 5 ? ('completed' as const) : ('pending' as const),
        })),
    },
}
