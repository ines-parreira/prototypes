import { Meta, StoryObj } from '@storybook/react'

import { ReactFlowProvider } from '../index'
import { CustomFitViewControl } from './CustomFitViewControl'

const meta: Meta = {
    title: 'Common/Flows/CustomFitViewControl',
    component: CustomFitViewControl,
}

export default meta

type Story = StoryObj<typeof CustomFitViewControl>

export const Default: Story = {
    render: () => (
        <ReactFlowProvider>
            <CustomFitViewControl />
        </ReactFlowProvider>
    ),
}
