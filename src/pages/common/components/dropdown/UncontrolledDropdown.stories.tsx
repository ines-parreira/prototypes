import React, {ComponentProps, useRef} from 'react'
import {Meta, Story} from '@storybook/react'

import Button from 'pages/common/components/button/Button'

import UncontrolledDropdown from './UncontrolledDropdown'

const storyConfig: Meta = {
    title: 'General/Dropdown/UncontrolledDropdown',
    component: UncontrolledDropdown,
}

const ExampleTemplate: Story<ComponentProps<typeof UncontrolledDropdown>> = (
    props
) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    return (
        <>
            <Button ref={buttonRef}>Click me</Button>

            <UncontrolledDropdown {...props} target={buttonRef}>
                Hello
            </UncontrolledDropdown>
        </>
    )
}

export const Example = ExampleTemplate.bind({})
Example.parameters = {controls: {include: ['placement']}}

export default storyConfig
