import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import IconButton from 'pages/common/components/button/IconButton'

const storyConfig: Meta = {
    title: 'General/Button/IconButton',
    component: IconButton,
    argTypes: {
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
            action: 'clicked!',
            table: {
                disable: true,
            },
        },
    },
}

const Template: StoryObj<typeof IconButton> = {
    render: function Template(props) {
        return <IconButton {...props} />
    },
}
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

const defaultProps: ComponentProps<typeof IconButton> = {
    children: 'check',
    fillStyle: 'fill',
    intent: 'primary',
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
