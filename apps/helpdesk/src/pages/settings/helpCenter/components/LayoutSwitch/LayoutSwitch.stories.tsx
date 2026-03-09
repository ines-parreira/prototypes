import React, { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { HelpCenterLayout } from '../../types/layout.enum'
import type { LayoutSwitchProps } from './LayoutSwitch'
import { LayoutSwitch } from './LayoutSwitch'

const storyConfig: Meta = {
    title: 'Help center/LayoutSwitch',
    component: LayoutSwitch,
}

type Story = StoryObj<typeof LayoutSwitch>

const Template: Story = {
    render: (args: LayoutSwitchProps) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [selectedLayout, setSelectedLayout] = useState<HelpCenterLayout>(
            args.selectedLayout,
        )

        const handleLayoutChange = (layout: HelpCenterLayout) =>
            setSelectedLayout(layout)

        return (
            <div style={{ width: '680px' }}>
                <LayoutSwitch
                    {...args}
                    selectedLayout={selectedLayout}
                    onLayoutChange={handleLayoutChange}
                />
            </div>
        )
    },
}

export const Default: Story = {
    ...Template,
    args: {
        selectedLayout: HelpCenterLayout.ONEPAGER,
        isOnePagerDisabled: false,
    },
}

export const OnePagerLayoutDisabled: Story = {
    ...Template,
    args: {
        selectedLayout: HelpCenterLayout.DEFAULT,
        isOnePagerDisabled: true,
    },
}

export default storyConfig
