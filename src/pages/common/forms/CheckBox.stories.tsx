import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import CheckBox from './CheckBox'

const storyConfig: Meta = {
    title: 'Data Entry/CheckBox',
    component: CheckBox,
    argTypes: {
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
        caption: {
            options: ['simple text', 'node'],
            mapping: {
                ['simple text']: 'This toggle is a checkbox in disguise',
                node: (
                    <>
                        <i className="material-icons">local_shipping</i> tutu
                    </>
                ),
            },
        },
    },
}

const Template: Story<ComponentProps<typeof CheckBox>> = (props) => {
    const [isChecked, setIsChecked] = useState(false)

    return (
        <CheckBox {...props} isChecked={isChecked} onChange={setIsChecked}>
            Check me
        </CheckBox>
    )
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

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
