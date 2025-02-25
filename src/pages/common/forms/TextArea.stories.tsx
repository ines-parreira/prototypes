import React, { ComponentProps, useState } from 'react'

import { Meta, Story } from '@storybook/react'

import TextArea from './TextArea'

const storyConfig: Meta = {
    title: 'Data Entry/TextArea',
    component: TextArea,
    argTypes: {
        caption: {
            options: ['none', 'simple text', 'node'],
            mapping: {
                none: null,
                ['simple text']: 'More information on this input',
                node: (
                    <>
                        <i className="material-icons">local_shipping</i> tutu
                    </>
                ),
            },
            control: {
                type: 'select',
            },
        },
        error: {
            control: {
                type: 'text',
            },
        },
        isDisabled: {
            control: {
                type: 'boolean',
            },
        },
        isRequired: {
            control: {
                type: 'boolean',
            },
        },
        label: {
            control: {
                type: 'text',
            },
        },
        placeholder: {
            control: {
                type: 'text',
            },
        },
        autoRowHeight: {
            control: {
                type: 'boolean',
            },
        },
        rows: {
            control: {
                type: 'number',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof TextArea>> = (props) => {
    const [value, setValue] = useState('')

    return <TextArea {...props} value={value} onChange={setValue} />
}

const templateParameters = {
    controls: {
        include: [
            'caption',
            'error',
            'isDisabled',
            'isRequired',
            'label',
            'placeholder',
            'autoRowHeight',
            'rows',
        ],
    },
}

const defaultProps: Partial<ComponentProps<typeof TextArea>> = {
    placeholder: 'Update me',
}

export const Default = Template.bind({})
Default.parameters = templateParameters
Default.args = defaultProps

export const LongTextOnMount: Story<ComponentProps<typeof TextArea>> = (
    props,
) => <TextArea {...props} />
LongTextOnMount.args = {
    ...defaultProps,
    autoRowHeight: true,
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(
        15,
    ),
}

export default storyConfig
