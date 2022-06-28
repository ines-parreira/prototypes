import _noop from 'lodash/noop'
import React, {ComponentProps, useRef, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import Button from 'pages/common/components/button/Button'

import DropdownItemLabel from './DropdownItemLabel'
import Dropdown from './Dropdown'
import DropdownBody from './DropdownBody'
import DropdownItem from './DropdownItem'

const storyConfig: Meta = {
    title: 'General/Dropdown/DropdownItemLabel',
    component: DropdownItemLabel,
}

const DefaultTemplate: Story<ComponentProps<typeof DropdownItemLabel>> = (
    props
) => <DropdownItemLabel {...props} />

const ExampleTemplate: Story<ComponentProps<typeof DropdownItemLabel>> = (
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
                    >
                        <DropdownItemLabel {...props} />
                    </DropdownItem>
                    <DropdownItem
                        option={{
                            label: 'Best-of menu',
                            value: 'bar',
                        }}
                        onClick={_noop}
                    >
                        <DropdownItemLabel {...props} />
                    </DropdownItem>
                </DropdownBody>
            </Dropdown>
        </div>
    )
}

const defaultProps = {
    caption: 'A delicious, nutritive and GMO free meal',
    children: 'Tacos & Burritos',
    prefix: <i className="material-icons">add</i>,
    suffix: (
        <i
            className="material-icons"
            style={{color: '#99A5B6', lineHeight: '37px'}}
        >
            chevron_right
        </i>
    ),
}

export const Default = DefaultTemplate.bind({})
Default.args = defaultProps

export const Example = ExampleTemplate.bind({})
Example.args = defaultProps

export default storyConfig
