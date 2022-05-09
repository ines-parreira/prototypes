import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import Button from 'pages/common/components/button/Button'

import InputGroup from './InputGroup'
import NumberInput from './NumberInput'
import TextInput from './TextInput'

const storyConfig: Meta = {
    title: 'Data Entry/Input/InputGroup',
    component: InputGroup,
}

const WithNumberInputTemplate: Story<ComponentProps<typeof InputGroup>> = (
    props
) => {
    const [firstInputCount, setFirstInputCount] = useState<number | undefined>(
        0
    )
    const [secondInputCount, setSecondInputCount] = useState<
        number | undefined
    >(0)

    return (
        <InputGroup {...props}>
            <Button intent="secondary">Foo</Button>
            <NumberInput
                hasControls={false}
                onChange={setFirstInputCount}
                value={firstInputCount}
            />
            <Button intent="secondary">Bar</Button>
            <NumberInput
                onChange={setSecondInputCount}
                value={secondInputCount}
            />
            <Button intent="secondary">Baz</Button>
        </InputGroup>
    )
}

const WithTextInputTemplate: Story<ComponentProps<typeof InputGroup>> = (
    props
) => {
    const [firstTextInput, setFirstTextInput] = useState<string>('')
    const [secondTextInput, setSecondTextInput] = useState<string>('')

    return (
        <InputGroup {...props}>
            <Button intent="secondary">Foo</Button>
            <TextInput onChange={setFirstTextInput} value={firstTextInput} />
            <Button intent="secondary">Bar</Button>
            <TextInput onChange={setSecondTextInput} value={secondTextInput} />
            <Button intent="secondary">Baz</Button>
        </InputGroup>
    )
}

export const WithNumberInput = WithNumberInputTemplate.bind({})
export const WithTextInput = WithTextInputTemplate.bind({})

export default storyConfig
