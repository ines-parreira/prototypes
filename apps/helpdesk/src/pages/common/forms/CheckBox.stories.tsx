import { ComponentProps, useState } from 'react'

import { Meta, StoryObj } from '@storybook/react'

import CheckBox from './CheckBox'

const storyConfig: Meta = {
    title: 'Data Entry/CheckBox',
    component: CheckBox,
    argTypes: {
        caption: {
            options: ['none', 'simple text', 'node'],
            mapping: {
                none: null,
                ['simple text']: 'More information on this checkbox',
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
        isDisabled: {
            control: {
                type: 'boolean',
            },
        },
        onChange: {
            action: 'clicked!',
            table: {
                disable: true,
            },
        },
    },
}

type TemplateProps = ComponentProps<typeof CheckBox>

const Template: StoryObj<TemplateProps> = {
    render: function Template({ ...props }) {
        const [isChecked, setIsChecked] = useState(false)

        return (
            <CheckBox {...props} isChecked={isChecked} onChange={setIsChecked}>
                Check me
            </CheckBox>
        )
    },
}

const defaultProps: Partial<ComponentProps<typeof CheckBox>> = {
    children: 'Check me',
    isChecked: false,
}

const templateParameters = {
    controls: {
        include: ['caption', 'isDisabled', 'isIndeterminate'],
    },
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
