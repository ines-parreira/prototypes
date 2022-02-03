import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import ToggleInput from './ToggleInput'

const storyConfig: Meta = {
    title: 'Data Entry/ToggleInput',
    component: ToggleInput,
    argTypes: {
        isDisabled: {
            control: {
                type: 'boolean',
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

const Template: Story<ComponentProps<typeof ToggleInput>> = ({
    children,
    ...other
}: ComponentProps<typeof ToggleInput>) => {
    const [isToggled, setIsToggled] = useState(false)

    return (
        <ToggleInput
            {...other}
            isToggled={isToggled}
            onClick={(nextValue) => setIsToggled(nextValue)}
        >
            {children}
        </ToggleInput>
    )
}

const defaultProps: Partial<ComponentProps<typeof ToggleInput>> = {
    children: 'Check me',
    isToggled: false,
}

const templateParameters = {
    controls: {
        include: ['caption', 'children', 'isDisabled', 'isLoading'],
    },
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
