import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { FlowProvider } from '../index'
import { CustomControls } from './CustomControls'

const meta: Meta = {
    title: 'Common/Flows/CustomControls',
    component: CustomControls,
}

export default meta

type Story = StoryObj<typeof CustomControls>

export const Default: Story = {
    render: () => (
        <FlowProvider>
            <CustomControls />
        </FlowProvider>
    ),
}
