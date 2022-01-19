import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'

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
    },
}

const Template: Story<ComponentProps<typeof RadioFieldSet>> = (props) => {
    const [selectedValue, setSelectedValue] = useState<string | null>(null)

    const update = (value?: string) => setSelectedValue(value!)

    return (
        <RadioFieldSet
            {...props}
            selectedValue={selectedValue}
            onChange={update}
        />
    )
}

const templateParameters = {
    controls: {
        include: ['isDisabled'],
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

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export const WithLabel = Template.bind({})
WithLabel.args = {
    ...defaultProps,
    label: 'With some content',
}
WithLabel.parameters = templateParameters

export const WithCaptions = Template.bind({})
WithCaptions.args = {
    ...defaultProps,
    options: defaultProps.options!.map((option) => ({
        ...option,
        caption: `${option.value!} food`,
    })),
}
WithCaptions.parameters = templateParameters

export default storyConfig
