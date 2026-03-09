import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import DropdownButton from './DropdownButton'

const storyConfig: Meta = {
    title: 'General/Button/DropdownButton',
    component: DropdownButton,
    argTypes: {
        intent: {
            control: {
                type: 'select',
            },
            options: ['primary', 'secondary', 'destructive'],
        },
        fillStyle: {
            control: {
                type: 'select',
            },
            options: ['fill', 'ghost'],
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

const Template: StoryObj<typeof DropdownButton> = {
    render: function Template(props) {
        return <DropdownButton {...props} />
    },
}
const templateParameters = {
    controls: {
        include: [
            'intent',
            'fillStyle',
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
    intent: 'primary',
    fillStyle: 'fill',
    isDisabled: false,
    isLoading: false,
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
