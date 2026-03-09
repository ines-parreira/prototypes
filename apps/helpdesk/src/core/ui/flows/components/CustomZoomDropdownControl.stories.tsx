import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { FlowProvider } from '../index'
import { CustomZoomDropdownControl } from './CustomZoomDropdownControl'

const meta: Meta = {
    title: 'Common/Flows/CustomZoomDropdownControl',
    component: CustomZoomDropdownControl,
}

export default meta

type Story = StoryObj<typeof CustomZoomDropdownControl>

export const Default: Story = {
    render: () => (
        <FlowProvider>
            <CustomZoomDropdownControl />
        </FlowProvider>
    ),
}
