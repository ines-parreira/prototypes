import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import LearnMoreLink from './LearnMoreLink'

const meta: Meta = {
    title: 'Common/Components/LearnMoreLink',
    component: LearnMoreLink,
    argTypes: {
        children: { control: 'text' },
        url: { control: 'text' },
    },
}

export default meta

type Story = StoryObj<typeof LearnMoreLink>

export const Default: Story = {
    render: (args) => <LearnMoreLink {...args} />,
    args: {
        children: 'Learn More',
        url: 'www.gorgias.com',
    },
}
