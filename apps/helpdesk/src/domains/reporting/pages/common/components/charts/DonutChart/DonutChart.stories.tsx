import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import DonutChart from 'domains/reporting/pages/common/components/charts/DonutChart/DonutChart'

const meta: Meta<typeof DonutChart> = {
    title: 'Stats/DonutChart ',
    component: DonutChart,
    argTypes: {
        data: {
            table: {
                disable: true,
            },
        },
    },
}

export default meta

type Story = StoryObj<typeof DonutChart>
export const Default: Story = {
    render: (args) => (
        <div style={{ width: 300 }}>
            <DonutChart {...args} />
        </div>
    ),
    args: {
        data: [
            { label: 'Label 1', value: 3000 },
            { label: 'Label 2', value: 5000 },
            { label: 'Label 3', value: 7000 },
        ],
    },
}
