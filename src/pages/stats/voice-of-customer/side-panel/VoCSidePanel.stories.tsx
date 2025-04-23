import React, { ComponentProps, useState } from 'react'

import { Meta, StoryFn } from '@storybook/react'
import { Input } from 'reactstrap'

import {
    TabKeys,
    VoCSidePanel,
} from 'pages/stats/voice-of-customer/side-panel/VoCSidePanel'

const storyConfig: Meta = {
    title: 'Stats/VoiceOfCustomer/VoCSidePanel',
    component: VoCSidePanel,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const Template: StoryFn<ComponentProps<typeof VoCSidePanel>> = () => (
    <VoCSidePanel isOpen={true} setIsOpen={() => {}} />
)

const ControlledPanel: StoryFn<ComponentProps<typeof VoCSidePanel>> = ({
    activeTab,
}) => {
    const [value, setValue] = useState('')
    return (
        <>
            <Input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={'Add a product ID'}
                autoFocus
                style={{ width: 200 }}
            />
            <VoCSidePanel
                isOpen={value !== ''}
                setIsOpen={() => setValue('')}
                activeTab={activeTab}
            />
        </>
    )
}

export const Default = Template.bind({})
const defaultProps: Partial<ComponentProps<typeof VoCSidePanel>> = {
    activeTab: TabKeys.trendOverview,
}

export { ControlledPanel }
ControlledPanel.args = defaultProps

export default storyConfig
