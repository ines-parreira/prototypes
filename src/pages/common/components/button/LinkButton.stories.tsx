import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import LinkButton from './LinkButton'

const storyConfig: Meta = {
    title: 'General/Button/LinkButton',
    component: LinkButton,
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
        size: {
            control: {
                type: 'select',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof LinkButton>> = (props) => (
    <LinkButton {...props} />
)
const templateParameters = {
    controls: {
        include: [
            'fillStyle',
            'href',
            'isDisabled',
            'rel',
            'size',
            'children',
            'onClick',
            'target',
        ],
    },
}

const defaultProps: ComponentProps<typeof LinkButton> = {
    children: 'Click me!',
    fillStyle: 'fill',
    href: '#',
    intent: 'primary',
    isDisabled: false,
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
