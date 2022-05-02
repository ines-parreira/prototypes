import React, {ComponentProps, CSSProperties, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import IconInput from './IconInput'
import InputField from './InputField'
import TextInput from './TextInput'

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

const SimpleInputTemplate: Story<ComponentProps<typeof InputField>> = (
    props: ComponentProps<typeof InputField>
) => {
    const [value, setValue] = useState('')

    return <InputField {...props} onChange={setValue} value={value} />
}

const pointerEvents: CSSProperties['pointerEvents'] = 'inherit'

const iconStyle = {
    cursor: 'pointer',
    pointerEvents,
}

const InputWithIconsTemplate: Story<ComponentProps<typeof InputField>> = (
    props: ComponentProps<typeof InputField>
) => {
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

export const SimpleInput = SimpleInputTemplate.bind({})
SimpleInput.args = defaultProps
SimpleInput.parameters = templateParameters

export const InputWithIcons = InputWithIconsTemplate.bind({})
InputWithIcons.args = defaultProps
InputWithIcons.parameters = templateParameters

export default storyConfig
