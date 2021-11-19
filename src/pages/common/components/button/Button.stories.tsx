import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Button, {ButtonIntent, ButtonSize} from './Button'

const storyConfig: Meta = {
    title: 'General/Button/Button',
    component: Button,
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

const Template: Story<ComponentProps<typeof Button>> = (props) => (
    <Button {...props} />
)
const templateParameters = {
    controls: {
        include: ['isDisabled', 'isLoading', 'size', 'children', 'onClick'],
    },
}

const defaultProps: ComponentProps<typeof Button> = {
    children: 'Click me!',
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
