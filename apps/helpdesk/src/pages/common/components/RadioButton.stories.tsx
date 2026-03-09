import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import RadioButton from './RadioButton'

const storyConfig: Meta = {
    title: 'Data Entry/RadioButton',
    component: RadioButton,
    argTypes: {
        caption: {
            control: {
                type: 'text',
            },
        },
    },
}

const Template: StoryObj<typeof RadioButton> = {
    render: function Template(props) {
        return <RadioButton {...props} />
    },
}

const templateParameters = {
    controls: {
        include: ['caption', 'label', 'isDisabled', 'isSelected'],
    },
}

const defaultProps: Partial<ComponentProps<typeof RadioButton>> = {
    label: 'I am a potato',
    value: 'potato',
    isDisabled: false,
    isSelected: false,
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
