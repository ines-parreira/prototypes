import React, {ComponentProps, useRef, useState} from 'react'
import {Meta, Story} from '@storybook/react'
import _noop from 'lodash/noop'

import Button from 'pages/common/components/button/Button'

import Dropdown from './Dropdown'
import DropdownBody from './DropdownBody'
import DropdownFooter from './DropdownFooter'
import DropdownItem from './DropdownItem'

const storyConfig: Meta = {
    title: 'General/Dropdown/DropdownFooter',
    component: DropdownFooter,
}

const DefaultTemplate: Story<ComponentProps<typeof DropdownFooter>> = (
    props
) => <DropdownFooter {...props} />

const ExampleTemplate: Story<ComponentProps<typeof DropdownFooter>> = (
    props
) => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    return (
        <div id="example-container">
            <Button onClick={() => setIsOpen(!isOpen)} ref={buttonRef}>
                Click me
            </Button>

            <Dropdown
                isOpen={isOpen}
                onToggle={setIsOpen}
                root={document.getElementById('example-container')!}
                target={buttonRef}
            >
                <DropdownBody>
                    <DropdownItem
                        option={{
                            label: 'Maxi best-of menu',
                            value: 'foo',
                        }}
                        onClick={_noop}
                    />

                    <DropdownItem
                        option={{
                            label: 'Best-of menu',
                            value: 'bar',
                        }}
                        onClick={_noop}
                    />
                </DropdownBody>

                <DropdownFooter {...props} />
            </Dropdown>
        </div>
    )
}

export const Default = DefaultTemplate.bind({})
Default.args = {
    children: <Button fillStyle="ghost">Foo bar</Button>,
}

export const Example = ExampleTemplate.bind({})
Example.args = {
    children: <Button fillStyle="ghost">Foo bar</Button>,
}

export default storyConfig
