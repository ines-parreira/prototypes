import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import NumberInput from './NumberInput'

const storyConfig: Meta = {
    title: 'Data Entry/Input/NumberInput',
    component: NumberInput,
    argTypes: {},
}

const Template: Story<ComponentProps<typeof NumberInput>> = (
    props: ComponentProps<typeof NumberInput>
) => {
    const [count, setCount] = useState(props.value)

    return <NumberInput {...props} onChange={setCount} value={count} />
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
        ],
    },
}

const defaultProps: Partial<ComponentProps<typeof NumberInput>> = {
    placeholder: '42',
    value: 0,
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export const WithIcon = Template.bind({})
WithIcon.args = {
    ...defaultProps,
    prefix: <i className="material-icons">attach_money</i>,
}
WithIcon.parameters = templateParameters

export const WithMax = Template.bind({})
WithMax.args = {
    ...defaultProps,
    max: 100,
    suffix: <div style={{color: '#99A5B6', lineHeight: '20px'}}>/100</div>,
}
WithMax.parameters = templateParameters

export default storyConfig
