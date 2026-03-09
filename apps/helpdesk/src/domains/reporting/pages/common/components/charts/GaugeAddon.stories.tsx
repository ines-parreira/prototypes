import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import GaugeAddon from 'domains/reporting/pages/common/components/charts/GaugeAddon'

const storyConfig: Meta = {
    title: 'Stats/GaugeAddon',
    component: GaugeAddon,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

type Story = StoryObj<typeof GaugeAddon>

const FirstGauge: Story = {
    render: () => (
        <div style={{ width: '200px' }}>
            <GaugeAddon progress={50} color="#EDEAFF">
                Lorem ipsum dolor sit 50%
            </GaugeAddon>
        </div>
    ),
}

export const Default = FirstGauge
export default storyConfig
