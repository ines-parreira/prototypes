import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { QuickFilters } from './QuickFilters'

const storyConfig: Meta = {
    title: 'Convert/QuickFilters',
    component: QuickFilters,
}

type Story = StoryObj<typeof QuickFilters>

const Template: Story = {
    render: (props) => <QuickFilters {...props} />,
}

export const Default = {
    ...Template,
    args: {
        defaultActiveFilters: [],
        filters: [
            {
                id: '1',
                label: 'Contains product cards',
            },
            {
                id: '2',
                label: 'Contains discount codes',
            },
            {
                id: '3',
                label: 'Triggered on exit intent',
            },
            {
                id: '4',
                label: 'Triggered outside business hours',
            },
        ],
    },
}

export default storyConfig
