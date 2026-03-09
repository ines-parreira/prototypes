import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import RadioFieldSet from './RadioFieldSet'

const storyConfig: Meta = {
    title: 'Data Entry/RadioFieldSet',
    component: RadioFieldSet,
    argTypes: {
        isDisabled: {
            control: {
                type: 'boolean',
            },
        },
        isHorizontal: {
            control: {
                type: 'boolean',
            },
        },
    },
}

type Story = StoryObj<typeof RadioFieldSet>

const Template: Story = {
    render: function Template({ ...props }) {
        const [selectedValue, setSelectedValue] = useState<string | null>(null)

        return (
            <RadioFieldSet
                {...props}
                selectedValue={selectedValue}
                onChange={setSelectedValue}
            />
        )
    },
}

const templateParameters = {
    controls: {
        include: ['isDisabled', 'isHorizontal'],
    },
}

const defaultProps: Partial<ComponentProps<typeof RadioFieldSet>> = {
    options: [
        {
            label: 'sushis and sashimis',
            value: 'japanese',
        },
        {
            label: 'tacos and nachos',
            value: 'mexican',
        },
        {
            label: 'pastas and pizzas',
            value: 'italian',
        },
    ],
    isDisabled: false,
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export const WithLabel = {
    ...Template,
    args: {
        ...defaultProps,
        label: 'With some content',
    },
}
WithLabel.parameters = templateParameters

export const WithCaptions = {
    ...Template,
    args: {
        ...defaultProps,
        options: defaultProps.options!.map((option) => ({
            ...option,
            caption: `${option.value} food`,
        })),
    },
}
WithCaptions.parameters = templateParameters

export const WithHorizontalLayout = {
    ...Template,
    args: {
        ...defaultProps,
        isHorizontal: true,
    },
}
WithHorizontalLayout.parameters = templateParameters

export default storyConfig
