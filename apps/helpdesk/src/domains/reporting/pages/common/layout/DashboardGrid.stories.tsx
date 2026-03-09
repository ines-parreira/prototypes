import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import DashboardGrid from 'domains/reporting/pages/common/layout/DashboardGrid'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'

const storyConfig: Meta<typeof DashboardGrid> = {
    title: 'Stats/DashboardGrid',
    component: DashboardGrid,
}

type Story = StoryObj<typeof DashboardGrid>

const Template: Story = {
    render: (props) => <DashboardGrid {...props} />,
}

const defaultProps: ComponentProps<typeof DashboardGrid> = {
    className: '',
    children: (
        <>
            <DashboardGridCell size={2}>Cell A</DashboardGridCell>
            <DashboardGridCell size={2}>Cell B</DashboardGridCell>
            <DashboardGridCell size={2}>Cell C</DashboardGridCell>
            <DashboardGridCell size={2}>Cell D</DashboardGridCell>
            <DashboardGridCell size={2}>Cell E</DashboardGridCell>
            <DashboardGridCell size={2}>Cell F</DashboardGridCell>
            <DashboardGridCell size={3}>Cell G</DashboardGridCell>
            <DashboardGridCell size={3}>Cell H</DashboardGridCell>
            <DashboardGridCell size={3}>Cell I</DashboardGridCell>
            <DashboardGridCell size={3}>Cell J</DashboardGridCell>
            <DashboardGridCell size={4}>Cell K</DashboardGridCell>
            <DashboardGridCell size={4}>Cell L</DashboardGridCell>
            <DashboardGridCell size={4}>Cell M</DashboardGridCell>
            <DashboardGridCell size={6}>Cell N</DashboardGridCell>
            <DashboardGridCell size={6}>Cell O</DashboardGridCell>
        </>
    ),
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export default storyConfig
