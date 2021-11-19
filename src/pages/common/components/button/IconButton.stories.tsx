import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {ButtonIntent, ButtonSize} from './Button'
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
    intent: ButtonIntent.Primary,
    isDisabled: false,
    isLoading: false,
    size: ButtonSize.Medium,
}

export const Primary = Template.bind({})
Primary.args = defaultProps
Primary.parameters = templateParameters

export const Secondary = Template.bind({})
Secondary.args = {
    ...defaultProps,
    intent: ButtonIntent.Secondary,
}
Secondary.parameters = templateParameters

export const Text = Template.bind({})
Text.args = {
    ...defaultProps,
    intent: ButtonIntent.Text,
}
Text.parameters = templateParameters

export const Creation = Template.bind({})
Creation.args = {
    ...defaultProps,
    intent: ButtonIntent.Creation,
}
Creation.parameters = templateParameters

export const Destructive = Template.bind({})
Destructive.args = {
    ...defaultProps,
    intent: ButtonIntent.Destructive,
}
Destructive.parameters = templateParameters

export default storyConfig
