import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import TimedeltaPicker from './TimedeltaPicker'

const storyConfig: Meta = {
    title: 'Data Entry/Input/TimedeltaPicker',
    component: TimedeltaPicker,
    argTypes: {
        max: {
            control: {
                type: 'number',
            },
        },
        min: {
            control: {
                type: 'number',
            },
        },
        units: {
            control: {
                type: 'array',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof TimedeltaPicker>> = (props) => {
    const [selectedValue, setSelectedValue] = useState<string>('')

    return (
        <TimedeltaPicker
            {...props}
            value={selectedValue}
            onChange={setSelectedValue}
        />
    )
}

const defaultProps: Partial<ComponentProps<typeof TimedeltaPicker>> = {
    units: [
        {label: 'minute(s) ago', value: 'm'},
        {label: 'hour(s) ago', value: 'h'},
        {label: 'day(s) ago', value: 'd'},
        {label: 'week(s) ago', value: 'w'},
    ],
}

const templateParameters = {
    controls: {
        include: ['max', 'min', 'units'],
    },
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
