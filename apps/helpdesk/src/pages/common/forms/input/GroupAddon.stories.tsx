import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Button } from '@gorgias/axiom'

import GroupAddon from './GroupAddon'
import InputGroup from './InputGroup'
import TextInput from './TextInput'

const storyConfig: Meta = {
    title: 'Data Entry/Input/Addon',
    component: GroupAddon,
}

type TemplateProps = ComponentProps<typeof GroupAddon>

const Template: StoryObj<TemplateProps> = {
    render: function Template({ ...props }) {
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
    },
}

const templateParameters = {
    controls: {
        include: ['className', 'isDisabled'],
    },
}

export const Default = {
    ...Template,
    parameters: templateParameters,
}

export default storyConfig
