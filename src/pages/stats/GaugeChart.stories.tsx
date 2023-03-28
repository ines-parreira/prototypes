import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {
    ChatWorkload,
    EmailWorkload,
    InstagramWorkload,
    PhoneWorkload,
    OthersWorkload,
} from 'fixtures/chart'

import GaugeChart from './GaugeChart'

const storyConfig: Meta = {
    title: 'Stats/GaugeChart',
    component: GaugeChart,
}

const Template: Story<ComponentProps<typeof GaugeChart>> = (props) => (
    <GaugeChart {...props} />
)

const defaultProps: ComponentProps<typeof GaugeChart> = {
    data: [
        ChatWorkload,
        EmailWorkload,
        InstagramWorkload,
        PhoneWorkload,
        OthersWorkload,
    ],
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
