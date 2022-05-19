import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import DropdownBody from './DropdownBody'

const storyConfig: Meta = {
    title: 'General/Dropdown/DropdownBody',
    component: DropdownBody,
}

const DefaultTemplate: Story<ComponentProps<typeof DropdownBody>> = (props) => (
    <DropdownBody {...props} style={{width: '200px'}} />
)

export const Default = DefaultTemplate.bind({})
Default.args = {
    children: (
        <ul>
            <li>Foo</li>
            <li>Bar</li>
            <li>Baz</li>
        </ul>
    ),
    className: '',
    isLoading: false,
}

export default storyConfig
