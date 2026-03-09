import type { ComponentProps } from 'react'

import _omit from 'lodash/omit'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import { action } from 'storybook/actions'

import ConfirmButton from './ConfirmButton'

const storyConfig: Meta = {
    title: 'General/Button/ConfirmButton',
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
        confirmationContent: {
            control: {
                type: 'text',
            },
        },
    },
}

const Template: StoryObj<typeof ConfirmButton> = {
    render: function Template(props) {
        return (
            <ConfirmButton
                {...props}
                onConfirm={() => {
                    action('clicked!')()
                }}
            />
        )
    },
}

const FormTemplate: StoryObj<typeof ConfirmButton> = {
    render: function FormTemplate(props) {
        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    action('submit!')(e)
                }}
            >
                <ConfirmButton {..._omit(props, 'onConfirm')} />
            </form>
        )
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
            'placement',
            'confirmationContent',
            'confirmationTitle',
            'intent',
        ],
    },
}

const defaultProps: ComponentProps<typeof ConfirmButton> = {
    children: 'Click me!',
    fillStyle: 'fill',
    intent: 'primary',
    isDisabled: false,
    isLoading: false,
    size: 'medium',
    confirmationContent: <>Are you sure?</>,
    confirmationTitle: "I'm a title",
}

export const Main = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export const WithinForm = {
    ...FormTemplate,
    args: {
        ...defaultProps,
        type: 'submit',
    },
    parameters: templateParameters,
}

export default storyConfig
