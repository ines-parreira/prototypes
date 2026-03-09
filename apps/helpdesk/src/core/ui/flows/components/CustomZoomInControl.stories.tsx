import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Flow } from '../index'
import { CustomZoomInControl } from './CustomZoomInControl'

const meta: Meta = {
    title: 'Common/Flows/CustomZoomInControl',
    component: CustomZoomInControl,
}

export default meta

type Story = StoryObj<typeof CustomZoomInControl>

export const Default: Story = {
    render: () => (
        <div style={{ height: '100%', width: '100%' }}>
            <Flow defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}>
                <CustomZoomInControl />
            </Flow>
        </div>
    ),
}

export const AtMaxZoom: Story = {
    render: () => (
        <div style={{ height: '100%', width: '100%' }}>
            <Flow defaultViewport={{ x: 0, y: 0, zoom: 1 }}>
                <CustomZoomInControl />
            </Flow>
        </div>
    ),
}
