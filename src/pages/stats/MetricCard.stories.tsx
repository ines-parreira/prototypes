import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import MetricCard from './MetricCard'
import DashboardSection from './DashboardSection'
import DashboardGridCell from './DashboardGridCell'

const storyConfig: Meta = {
    title: 'Stats/MetricCard',
    component: MetricCard,
}

const Template: Story<ComponentProps<typeof MetricCard>> = (props) => (
    <MetricCard {...props} />
)

const defaultProps: ComponentProps<typeof MetricCard> = {
    className: '',
    children: 'Card content',
}

export const Default = Template.bind({})
Default.args = defaultProps

const GridTemplate: Story = () => (
    <DashboardSection title="">
        <DashboardGridCell size={6}>
            <MetricCard {...defaultProps} />
        </DashboardGridCell>
        <DashboardGridCell size={3}>
            <MetricCard {...defaultProps} />
        </DashboardGridCell>
        <DashboardGridCell size={3}>
            <MetricCard {...defaultProps} />
        </DashboardGridCell>
        <DashboardGridCell size={4}>
            <MetricCard {...defaultProps} />
        </DashboardGridCell>
        <DashboardGridCell size={8}>
            <MetricCard {...defaultProps} />
        </DashboardGridCell>
        <DashboardGridCell size={6}>
            <MetricCard {...defaultProps} />
        </DashboardGridCell>
    </DashboardSection>
)

export const InGrid = GridTemplate.bind({})

export default storyConfig
