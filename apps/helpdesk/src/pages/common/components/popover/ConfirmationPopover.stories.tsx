import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from '@storybook/react'
import { action } from 'storybook/actions'

import IconButton from 'pages/common/components/button/IconButton'

import ConfirmationPopover from './ConfirmationPopover'

const storyConfig: Meta = {
    title: 'General/Popover/ConfirmationPopover',
    argTypes: {
        placement: {
            control: {
                type: 'select',
            },
            options: [
                'auto-start',
                'auto',
                'auto-end',
                'top-start',
                'top',
                'top-end',
                'right-start',
                'right',
                'right-end',
                'bottom-end',
                'bottom',
                'bottom-start',
                'left-end',
                'left',
                'left-start',
            ],
        },
    },
}

const Template: StoryObj<typeof ConfirmationPopover> = {
    render: function Template(props) {
        return (
            <ConfirmationPopover
                {...props}
                onConfirm={() => {
                    action('clicked!')()
                }}
            >
                {({ uid, onDisplayConfirmation, elementRef }) => (
                    <IconButton
                        id={uid}
                        onClick={onDisplayConfirmation}
                        ref={elementRef}
                    >
                        add
                    </IconButton>
                )}
            </ConfirmationPopover>
        )
    },
}

const FormTemplate: StoryObj<typeof ConfirmationPopover> = {
    render: function FormTemplate(props) {
        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    action('submit!')(e)
                }}
            >
                <ConfirmationPopover {...props}>
                    {({ uid, onDisplayConfirmation, elementRef }) => (
                        <IconButton
                            id={uid}
                            onClick={onDisplayConfirmation}
                            ref={elementRef}
                        >
                            add
                        </IconButton>
                    )}
                </ConfirmationPopover>
            </form>
        )
    },
}

const templateParameters = {
    controls: {
        include: ['buttonProps', 'content', 'placement', 'title'],
    },
}

const defaultProps: Partial<ComponentProps<typeof ConfirmationPopover>> = {
    buttonProps: { type: 'button' },
    content: 'Are you sure?',
    placement: 'bottom',
    title: "I'm a title",
}

export const Main = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export const WithinForm = {
    ...FormTemplate,
    args: { ...defaultProps, buttonProps: { type: 'submit' } },
    parameters: templateParameters,
}

export default storyConfig
