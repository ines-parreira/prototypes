import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import NumberInput from './NumberInput'

const storyConfig: Meta = {
    title: 'Data Entry/Input/NumberInput',
    component: NumberInput,
    argTypes: {},
}

type Story = StoryObj<typeof NumberInput>

const Template: Story = {
    render: function Template({ ...props }) {
        const [count, setCount] = useState(props.value)

        return <NumberInput {...props} onChange={setCount} value={count} />
    },
}

const templateParameters = {
    controls: {
        include: [
            'hasControls',
            'hasError',
            'isDisabled',
            'max',
            'min',
            'placeholder',
            'value',
            'step',
        ],
    },
}

const defaultProps: Partial<ComponentProps<typeof NumberInput>> = {
    placeholder: '42',
    value: 0,
    step: 1,
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export const WithIcon = {
    ...Template,
    args: {
        ...defaultProps,
        prefix: <i className="material-icons">attach_money</i>,
    },
    parameters: templateParameters,
}

export const WithMax = {
    ...Template,
    args: {
        ...defaultProps,
        max: 100,
        suffix: (
            <div style={{ color: '#99A5B6', lineHeight: '20px' }}>/100</div>
        ),
    },
    parameters: templateParameters,
}

export default storyConfig
