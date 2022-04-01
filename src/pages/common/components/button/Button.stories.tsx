import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Button from './Button'

const storyConfig: Meta = {
    title: 'General/Button/Button',
    component: Button,
    argTypes: {
        fillStyle: {
            control: {
                type: 'select',
            },
        },
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
        include: [
            'fillStyle',
            'isDisabled',
            'isLoading',
            'size',
            'children',
            'onClick',
        ],
    },
}

const defaultProps: ComponentProps<typeof Button> = {
    children: 'Click me!',
    fillStyle: 'fill',
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

export const Destructive = Template.bind({})
Destructive.args = {
    ...defaultProps,
    intent: 'destructive',
}
Destructive.parameters = templateParameters

export default storyConfig
