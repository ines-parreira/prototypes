import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import TextInput from './TextInput'

const storyConfig: Meta = {
    title: 'Data Entry/TextInput',
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

const Template: Story<ComponentProps<typeof TextInput>> = (props) => {
    const [value, setValue] = useState('')

    return <TextInput {...props} value={value} onChange={setValue} />
}

const templateParameters = {
    controls: {
        include: ['hasError', 'isDisabled', 'isRequired', 'placeholder'],
    },
}

export const Default = Template.bind({})
Default.parameters = templateParameters

export default storyConfig
