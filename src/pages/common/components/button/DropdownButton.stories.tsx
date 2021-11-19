import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {ButtonIntent, ButtonSize} from './Button'
import DropdownButton from './DropdownButton'

const storyConfig: Meta = {
    title: 'General/Button/DropdownButton',
    component: DropdownButton,
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
            action: 'main action clicked!',
            table: {
                disable: true,
            },
        },
        onToggleClick: {
            action: 'toggle dropdown clicked!',
            table: {
                disable: true,
            },
        },
    },
}

const Template: Story<ComponentProps<typeof DropdownButton>> = (props) => (
    <DropdownButton {...props} />
)
const templateParameters = {
    controls: {
        include: [
            'isDisabled',
            'isLoading',
            'size',
            'children',
            'onClick',
            'onToggleClick',
        ],
    },
}

const defaultProps: Partial<ComponentProps<typeof DropdownButton>> = {
    children: 'Click me!',
    color: ButtonIntent.Primary,
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
