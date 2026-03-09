import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

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
                type: 'object',
            },
        },
    },
}

type Story = StoryObj<typeof TimedeltaPicker>

const Template: Story = {
    render: function Template({ ...props }) {
        const [selectedValue, setSelectedValue] = useState<string>('')

        return (
            <TimedeltaPicker
                {...props}
                value={selectedValue}
                onChange={setSelectedValue}
            />
        )
    },
}

const defaultProps: Partial<ComponentProps<typeof TimedeltaPicker>> = {
    units: [
        { label: 'minute(s) ago', value: 'm' },
        { label: 'hour(s) ago', value: 'h' },
        { label: 'day(s) ago', value: 'd' },
        { label: 'week(s) ago', value: 'w' },
    ],
}

const templateParameters = {
    controls: {
        include: ['max', 'min', 'units'],
    },
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
