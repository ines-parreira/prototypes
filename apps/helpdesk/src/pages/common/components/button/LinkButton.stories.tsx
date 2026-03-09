import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

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

const Template: StoryObj<typeof LinkButton> = {
    render: function Template(props) {
        return <LinkButton {...props} />
    },
}
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

export const Primary = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export const Secondary = {
    ...Template,
    args: {
        ...defaultProps,
        intent: 'secondary',
    },
    parameters: templateParameters,
}

export const Destructive = {
    ...Template,
    args: {
        ...defaultProps,
        intent: 'destructive',
    },
    parameters: templateParameters,
}

export default storyConfig
