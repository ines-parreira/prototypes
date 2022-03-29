import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import PhoneNumberInput from './PhoneNumberInput'

const storyConfig: Meta = {
    title: 'Data Entry/Input/PhoneNumberInput',
    component: PhoneNumberInput,
}

const Template: Story<ComponentProps<typeof PhoneNumberInput>> = ({
    value,
    ...other
}: ComponentProps<typeof PhoneNumberInput>) => {
    const [phoneNumber, setPhoneNumber] = useState(value || '')

    return (
        <div style={{width: '300px'}}>
            <PhoneNumberInput
                {...other}
                onChange={setPhoneNumber}
                value={phoneNumber}
            />
        </div>
    )
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

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
