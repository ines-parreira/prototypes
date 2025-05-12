import { ComponentProps, useState } from 'react'

import { Meta, StoryObj } from '@storybook/react'

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

type Story = StoryObj<typeof ToggleInput>

const Template: Story = {
    render: function Template({ children, ...other }) {
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
    },
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

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
