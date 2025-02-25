import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import DashboardGridCell from './DashboardGridCell'

const storyConfig: Meta = {
    title: 'Stats/DashboardGridCell',
    component: DashboardGridCell,
}

const Template: Story<ComponentProps<typeof DashboardGridCell>> = (props) => (
    <DashboardGridCell {...props} />
)

const defaultProps: ComponentProps<typeof DashboardGridCell> = {
    className: '',
    children: 'Content grid',
    size: 12,
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
