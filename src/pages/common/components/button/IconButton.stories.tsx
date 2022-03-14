import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import IconButton from './IconButton'

const storyConfig: Meta = {
    title: 'General/Button/IconButton',
    component: IconButton,
    argTypes: {
        isDisabled: {
            control: {
                type: 'boolean',
            },
        },
        isLoading: {
            control: {
                type: 'boolean',
            },
        },
        size: {
            control: {
                type: 'select',
            },
        },
        onClick: {
            action: 'clicked!',
            table: {
                disable: true,
            },
        },
    },
}

const Template: Story<ComponentProps<typeof IconButton>> = (props) => (
    <IconButton {...props} />
)
const templateParameters = {
    controls: {
        include: ['isDisabled', 'isLoading', 'size', 'children', 'onClick'],
    },
}

const defaultProps: ComponentProps<typeof IconButton> = {
    children: 'check',
    intent: 'primary',
    isDisabled: false,
    isLoading: false,
    size: 'medium',
}

export const Primary = Template.bind({})
Primary.args = defaultProps
Primary.parameters = templateParameters

export const Secondary = Template.bind({})
Secondary.args = {
    ...defaultProps,
    intent: 'secondary',
}
Secondary.parameters = templateParameters

export const Text = Template.bind({})
Text.args = {
    ...defaultProps,
    intent: 'text',
}
Text.parameters = templateParameters

export const Destructive = Template.bind({})
Destructive.args = {
    ...defaultProps,
    intent: 'destructive',
}
Destructive.parameters = templateParameters

export default storyConfig
