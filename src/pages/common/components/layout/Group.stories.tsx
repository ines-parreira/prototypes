import { Meta, StoryObj } from '@storybook/react'
import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import IconButton from 'pages/common/components/button/IconButton'

import Group from './Group'

const storyConfig: Meta = {
    title: 'General/Layout/Group',
    component: Group,
}

const WithButtonTemplate: StoryObj<typeof Group> = {
    render: function WithButtonTemplate(props) {
        return (
            <Group {...props}>
                <IconButton>add</IconButton>
                <Button intent="secondary">Foo</Button>
                <Button intent="secondary">Bar</Button>
                <ConfirmButton>Baz</ConfirmButton>
            </Group>
        )
    },
}

export const WithButtons = {
    ...WithButtonTemplate,
    args: {},
}

const WithVerticalOrientationTemplate: StoryObj<typeof Group> = {
    render: function WithVerticalOrientationTemplate() {
        return (
            <Group orientation="vertical">
                <IconButton>add</IconButton>
                <Button>Foo</Button>
                <Button>Bar</Button>
                <ConfirmButton>{`I'm a long button label`}</ConfirmButton>
            </Group>
        )
    },
}

export const WithVerticalOrientation = {
    ...WithVerticalOrientationTemplate,
    args: {},
}

const WithDropdownTemplate: StoryObj<typeof Group> = {
    render: function WithDropdownTemplate() {
        return (
            <UncontrolledDropdown>
                <Group>
                    <Button>Foo</Button>
                    <DropdownToggle tag="span">
                        <IconButton>arrow_drop_down</IconButton>
                    </DropdownToggle>
                </Group>
                <DropdownMenu>hello</DropdownMenu>
            </UncontrolledDropdown>
        )
    },
}

export const WithDropdown = {
    ...WithDropdownTemplate,
    args: {},
}

export default storyConfig
