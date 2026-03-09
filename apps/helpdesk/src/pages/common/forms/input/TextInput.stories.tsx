import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import IconInput from './IconInput'
import TextInput from './TextInput'

const storyConfig: Meta = {
    title: 'Data Entry/Input/TextInput',
    component: TextInput,
    argTypes: {
        hasError: {
            control: {
                type: 'boolean',
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
        onChange: {
            action: 'changed!',
            table: {
                disable: true,
            },
        },
        placeholder: {
            control: {
                type: 'text',
            },
        },
    },
}

type Story = StoryObj<typeof TextInput>

const Template: Story = {
    render: function Template({ ...props }) {
        const [value, setValue] = useState('')

        return <TextInput {...props} value={value} onChange={setValue} />
    },
}

const TemplateWithIcons: Story = {
    render: function TemplateWithIcons({ ...props }) {
        const [value, setValue] = useState('')

        return (
            <TextInput
                {...props}
                value={value}
                onChange={setValue}
                prefix={<IconInput icon="search" />}
                suffix={<IconInput icon="block" onClick={() => setValue('')} />}
            />
        )
    },
}

const templateParameters = {
    controls: {
        include: ['hasError', 'isDisabled', 'isRequired', 'placeholder'],
    },
}

export const Default = {
    ...Template,
    parameters: templateParameters,
}

export const WithIcons = {
    ...TemplateWithIcons,
    parameters: templateParameters,
}

export default storyConfig
