import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Button from 'pages/common/components/button/Button'
import InputGroup from './InputGroup'
import TextInput from './TextInput'
import GroupAddon from './GroupAddon'

const storyConfig: Meta = {
    title: 'Data Entry/Input/Addon',
    component: GroupAddon,
}

const Template: Story<ComponentProps<typeof GroupAddon>> = (props) => {
    return (
        <>
            <p>
                <InputGroup>
                    <TextInput />
                    <GroupAddon {...props}>.postfix</GroupAddon>
                </InputGroup>
            </p>
            <p>
                <InputGroup>
                    <GroupAddon {...props}>prefix.</GroupAddon>
                    <TextInput />
                </InputGroup>
            </p>
            <p>
                <InputGroup>
                    <TextInput />
                    <GroupAddon {...props}>.middlefix.</GroupAddon>
                    <TextInput />
                </InputGroup>
            </p>
            <p>
                <InputGroup>
                    <Button>Button</Button>
                    <GroupAddon {...props}>prefix.</GroupAddon>
                    <TextInput />
                </InputGroup>
            </p>
            <p>
                <InputGroup>
                    <TextInput />
                    <GroupAddon {...props}>prefix.</GroupAddon>
                    <Button>Button</Button>
                </InputGroup>
            </p>
            <p>
                <InputGroup isDisabled>
                    <TextInput value="disabled" />
                    <GroupAddon {...props}>.disabled.postifix</GroupAddon>
                </InputGroup>
            </p>
        </>
    )
}

export const Default = Template.bind({})
Default.parameters = {controls: {include: ['className', 'isDisabled']}}

export default storyConfig
