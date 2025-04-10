import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import GaugeAddon from 'pages/stats/common/components/charts/GaugeAddon'

const storyConfig: Meta = {
    title: 'Stats/GaugeAddon',
    component: GaugeAddon,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const FirstGauge: Story<ComponentProps<typeof GaugeAddon>> = () => (
    <div style={{ width: '200px' }}>
        <GaugeAddon progress={50} color="#EDEAFF">
            Lorem ipsum dolor sit 50%
        </GaugeAddon>
    </div>
)

export const Default = FirstGauge.bind({})
export default storyConfig
