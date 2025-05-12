import type { ComponentProps } from 'react'

import { Meta, StoryObj } from '@storybook/react'

import DashboardGridCell from './DashboardGridCell'

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
