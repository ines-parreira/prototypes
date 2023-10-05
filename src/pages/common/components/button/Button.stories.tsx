import {ComponentProps} from 'react'
import {Meta, StoryObj} from '@storybook/react'

import Button from './Button'

const storyConfig: Meta<typeof Button> = {
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

type Story = StoryObj<typeof Button>

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

export default storyConfig
