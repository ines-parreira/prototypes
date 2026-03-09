import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import PhoneNumberInput from './PhoneNumberInput'

const storyConfig: Meta = {
    title: 'Data Entry/Input/PhoneNumberInput',
    component: PhoneNumberInput,
}

type Story = StoryObj<typeof PhoneNumberInput>

const Template: Story = {
    render: function Template({ ...props }) {
        const [phoneNumber, setPhoneNumber] = useState(props.value || '')

        return (
            <div style={{ width: '300px' }}>
                <PhoneNumberInput
                    {...props}
                    onChange={setPhoneNumber}
                    value={phoneNumber}
                />
            </div>
        )
    },
}

const templateParameters = {
    controls: {
        include: ['disabled', 'placeholder'],
    },
}

const defaultProps: Partial<ComponentProps<typeof PhoneNumberInput>> = {
    placeholder: '+33 6 00 11 22 33',
    value: '',
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
