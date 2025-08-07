import { Meta, StoryObj } from '@storybook/react'

import { ReactFlowProvider } from '../index'
import { CustomControls } from './CustomControls'

const meta: Meta = {
    title: 'Common/Flows/CustomControls',
    component: CustomControls,
}

export default meta

type Story = StoryObj<typeof CustomControls>

export const Default: Story = {
    render: () => (
        <ReactFlowProvider>
            <CustomControls />
        </ReactFlowProvider>
    ),
}
