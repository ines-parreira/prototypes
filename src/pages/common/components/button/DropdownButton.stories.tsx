import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

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
    color: 'primary',
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
