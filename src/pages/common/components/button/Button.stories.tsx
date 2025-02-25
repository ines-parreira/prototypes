import { ComponentProps } from 'react'

import { Meta, StoryObj } from '@storybook/react'

import Button from './Button'

const storyConfig: Meta<typeof Button> = {
    title: 'General/Button/Button',
    component: Button,
    argTypes: {
        fillStyle: {
            control: {
                type: 'select',
            },
            options: ['fill', 'ghost'],
        },
        intent: {
            control: {
                type: 'select',
            },
            options: ['primary', 'secondary', 'destructive'],
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
            options: ['medium', 'small'],
        },
        onClick: {
            action: 'clicked!',
            table: {
                disable: true,
            },
        },
        leadingIcon: {
            control: {
                type: 'text',
            },
        },
        trailingIcon: {
            control: {
                type: 'text',
            },
        },
    },
}

type Story = StoryObj<typeof Button>

const templateParameters = {
    controls: {
        include: [
            'fillStyle',
            'intent',
            'isDisabled',
            'isLoading',
            'size',
            'children',
            'onClick',
            'leadingIcon',
            'trailingIcon',
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

/** This should be the button that we use to suggest to the user to do something */
export const Primary: Story = {
    args: defaultProps,
    parameters: {
        ...templateParameters,
    },
}

/** Another description on the story, overriding the comments */
export const Secondary: Story = {
    args: {
        ...defaultProps,
        intent: 'secondary',
    },
    parameters: {
        ...templateParameters,
    },
}

export const Destructive: Story = {
    args: {
        ...defaultProps,
        intent: 'destructive',
    },
    parameters: {
        ...templateParameters,
        docs: {
            description: {
                story: 'Only for destructive action!',
            },
        },
    },
}

export const LeadingIcon: Story = {
    args: {
        ...defaultProps,
        leadingIcon: 'add',
    },
    parameters: {
        ...templateParameters,
    },
}

export const TrailingIcon: Story = {
    args: {
        ...defaultProps,
        trailingIcon: 'arrow_drop_down',
    },
    parameters: {
        ...templateParameters,
    },
}

export default storyConfig
