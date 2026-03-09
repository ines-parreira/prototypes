import type { ComponentProps, CSSProperties } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import IconInput from './IconInput'
import InputField from './InputField'
import type TextInput from './TextInput'

const storyConfig: Meta = {
    title: 'Data Entry/InputField',
    component: InputField,
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
            description:
                'Displays an error message and a specific error style to the input',
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
    },
}

type SimpleInputTemplateProps = ComponentProps<typeof InputField>

const SimpleInputTemplate: StoryObj<SimpleInputTemplateProps> = {
    render: function Template({ ...props }) {
        const [value, setValue] = useState('')

        return <InputField {...props} onChange={setValue} value={value} />
    },
}

const pointerEvents: CSSProperties['pointerEvents'] = 'inherit'

const iconStyle = {
    cursor: 'pointer',
    pointerEvents,
}

type InputWithIconsTemplateProps = ComponentProps<typeof InputField>

const InputWithIconsTemplate: StoryObj<InputWithIconsTemplateProps> = {
    render: function Template({ ...props }) {
        const [value, setValue] = useState('')

        return (
            <InputField
                {...props}
                value={value}
                onChange={setValue}
                prefix={<IconInput icon="search" />}
                suffix={
                    <IconInput
                        style={iconStyle}
                        icon="block"
                        onClick={() => setValue('')}
                    />
                }
            />
        )
    },
}

const defaultProps: Partial<
    ComponentProps<typeof InputField> & ComponentProps<typeof TextInput>
> = {
    label: 'Name',
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
        ],
    },
}

export const SimpleInput = {
    ...SimpleInputTemplate,
    args: defaultProps,
    parameters: templateParameters,
}

export const InputWithIcons = {
    ...InputWithIconsTemplate,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
