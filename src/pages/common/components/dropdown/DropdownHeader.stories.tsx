import React, {ComponentProps, useRef, useState} from 'react'
import {Meta, Story} from '@storybook/react'
import _noop from 'lodash/noop'

import Button from 'pages/common/components/button/Button'

import Dropdown from './Dropdown'
import DropdownBody from './DropdownBody'
import DropdownHeader from './DropdownHeader'
import DropdownItem from './DropdownItem'

const storyConfig: Meta = {
    title: 'General/Dropdown/DropdownHeader',
    component: DropdownHeader,
}

const DefaultTemplate: Story<ComponentProps<typeof DropdownHeader>> = (
    props
) => <DropdownHeader {...props} />

const ExampleTemplate: Story<ComponentProps<typeof DropdownHeader>> = (
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
                <DropdownHeader {...props} />

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
            </Dropdown>
        </div>
    )
}

const defaultProps = {
    children: 'Back',
    prefix: <i className="material-icons">arrow_back</i>,
}

export const Default = DefaultTemplate.bind({})
Default.args = defaultProps

export const Example = ExampleTemplate.bind({})
Example.args = {...defaultProps, onClick: () => console.warn(`Header clicked!`)}

export default storyConfig
