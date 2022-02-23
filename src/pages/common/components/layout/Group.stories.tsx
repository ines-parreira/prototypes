import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'
import {UncontrolledDropdown, DropdownMenu, DropdownToggle} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import IconButton from 'pages/common/components/button/IconButton'

import Group from './Group'
import GroupItem from './GroupItem'

const storyConfig: Meta = {
    title: 'General/Layout/Group',
    component: Group,
}

const WithButtonTemplate: Story<ComponentProps<typeof Group>> = () => (
    <Group>
        <IconButton>add</IconButton>
        <Button>Foo</Button>
        <Button>Bar</Button>
        <ConfirmButton>Baz</ConfirmButton>
    </Group>
)

export const WithButtons = WithButtonTemplate.bind({})

const WithVerticalOrientationTemplate: Story<ComponentProps<typeof Group>> =
    () => (
        <Group orientation="vertical">
            <IconButton>add</IconButton>
            <Button>Foo</Button>
            <Button>Bar</Button>
            <ConfirmButton>I'm a long button label</ConfirmButton>
        </Group>
    )

export const WithVerticalOrientation = WithVerticalOrientationTemplate.bind({})

const WithDropdownTemplate: Story<ComponentProps<typeof Group>> = () => (
    <UncontrolledDropdown>
        <Group>
            <Button>Foo</Button>
            <GroupItem>
                {(appendPosition) => (
                    <DropdownToggle tag="span">
                        <IconButton appendPosition={appendPosition}>
                            arrow_drop_down
                        </IconButton>
                    </DropdownToggle>
                )}
            </GroupItem>
        </Group>
        <DropdownMenu>hello</DropdownMenu>
    </UncontrolledDropdown>
)

export const WithDropdown = WithDropdownTemplate.bind({})

export default storyConfig
