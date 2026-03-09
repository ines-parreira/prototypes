import type { Meta, StoryObj } from 'storybook-react-rsbuild'

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
            onDismiss={() => Promise.resolve()}
            onCreateArticle={() => Promise.resolve()}
        />
    ),
}

export const TopQuestionCardLoading: StoryObj<
    typeof TopQuestionCardLoadingComponent
> = {
    render: () => <TopQuestionCardLoadingComponent />,
}
