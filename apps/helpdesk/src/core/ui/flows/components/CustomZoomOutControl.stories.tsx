import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Flow } from '../index'
import { CustomZoomOutControl } from './CustomZoomOutControl'

const meta: Meta = {
    title: 'Common/Flows/CustomZoomOutControl',
    component: CustomZoomOutControl,
}

export default meta

type Story = StoryObj<typeof CustomZoomOutControl>

export const Default: Story = {
    render: () => (
        <div style={{ height: '100%', width: '100%' }}>
            <Flow defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}>
                <CustomZoomOutControl />
            </Flow>
        </div>
    ),
}

export const AtMinZoom: Story = {
    render: () => (
        <div style={{ height: '100%', width: '100%' }}>
            <Flow defaultViewport={{ x: 0, y: 0, zoom: 0.1 }}>
                <CustomZoomOutControl />
            </Flow>
        </div>
    ),
}
