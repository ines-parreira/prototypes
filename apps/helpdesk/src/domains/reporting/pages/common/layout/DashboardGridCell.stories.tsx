import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'

const storyConfig: Meta<typeof DashboardGridCell> = {
    title: 'Stats/DashboardGridCell',
    component: DashboardGridCell,
}

type Story = StoryObj<typeof DashboardGridCell>

const Template: Story = {
    render: (props) => <DashboardGridCell {...props} />,
}

const defaultProps: ComponentProps<typeof DashboardGridCell> = {
    className: '',
    children: 'Content grid',
    size: 12,
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export default storyConfig
