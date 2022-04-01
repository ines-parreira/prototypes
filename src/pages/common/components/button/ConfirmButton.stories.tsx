import React, {ComponentProps} from 'react'
import {action} from '@storybook/addon-actions'
import {Meta, Story} from '@storybook/react'
import _omit from 'lodash/omit'

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
                options: {
                    Primary: 'primary',
                    Secondary: 'secondary',
                    Destructive: 'destructive',
                },
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
                options: {
                    Medium: 'medium',
                    Small: 'small',
                },
            },
        },
        confirmationContent: {
            control: {
                type: null,
            },
        },
    },
}

const Template: Story<ComponentProps<typeof ConfirmButton>> = (props) => (
    <ConfirmButton
        {...props}
        onConfirm={() => {
            action('clicked!')()
        }}
    />
)

const FormTemplate: Story<ComponentProps<typeof ConfirmButton>> = (props) => (
    <form
        onSubmit={(e) => {
            e.preventDefault()
            action('submit!')(e)
        }}
    >
        <ConfirmButton {..._omit(props, 'onConfirm')} />
    </form>
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

export const Main = Template.bind({})
Main.args = defaultProps
Main.parameters = templateParameters

export const WithinForm = FormTemplate.bind({})
WithinForm.args = {
    ...defaultProps,
    type: 'submit',
}
WithinForm.parameters = templateParameters

export default storyConfig
