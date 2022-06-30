import React, {ComponentProps, useRef, useState} from 'react'
import {Meta, Story} from '@storybook/react'
import _noop from 'lodash/noop'

import Button from 'pages/common/components/button/Button'

import Dropdown, {DropdownContext} from './Dropdown'
import DropdownBody from './DropdownBody'
import DropdownItem from './DropdownItem'
import DropdownSearch from './DropdownSearch'
import DropdownSection from './DropdownSection'

const storyConfig: Meta = {
    title: 'General/Dropdown/DropdownSection',
    component: DropdownSection,
}

const DefaultTemplate: Story<ComponentProps<typeof DropdownSection>> = (
    props
) => (
    <DropdownContext.Provider
        value={{
            getHighlightedLabel: () => null,
            onQueryChange: _noop,
            isMultiple: false,
            onToggle: _noop,
            query: '',
            value: '',
        }}
    >
        <DropdownSection {...props} />
    </DropdownContext.Provider>
)

const ExampleTemplate: Story<ComponentProps<typeof DropdownSection>> = (
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
                <DropdownSearch />

                <DropdownBody>
                    <DropdownSection {...props}>
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
                    </DropdownSection>

                    <DropdownSection {...props}>
                        <DropdownItem
                            option={{
                                label: 'Fries',
                                value: 'foo',
                            }}
                            onClick={_noop}
                        />
                        <DropdownItem
                            option={{
                                label: 'Chips',
                                value: 'bar',
                            }}
                            onClick={_noop}
                        />
                    </DropdownSection>
                </DropdownBody>
            </Dropdown>
        </div>
    )
}

export const Default = DefaultTemplate.bind({})
Default.args = {
    children: <div>Bar</div>,
    title: 'Foo',
}

export const Example = ExampleTemplate.bind({})
Example.args = {
    title: 'Foo',
}

export default storyConfig
