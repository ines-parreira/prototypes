import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import {Chip} from './Chip'

const storyConfig: Meta = {
    title: 'Data Display/Chip',
    component: Chip,
}

const Template: Story<ComponentProps<typeof Chip>> = (props) => (
    <Chip {...props} />
)

export const Default = Template.bind({})
Default.args = {
    id: '1',
    label: 'Triggered outside business hours',
    onClick: () => null,
}

export const Active = Template.bind({})
Active.args = {
    ...Default.args,
    isActive: true,
}

export const Disabled = Template.bind({})
Disabled.args = {
    ...Default.args,
    isDisabled: true,
}

export default storyConfig
