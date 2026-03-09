import { useRef, useState } from 'react'

import _noop from 'lodash/noop'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Button } from '@gorgias/axiom'

import Dropdown, { DropdownContext } from './Dropdown'
import DropdownBody from './DropdownBody'
import DropdownItem from './DropdownItem'
import DropdownSearch from './DropdownSearch'
import DropdownSection from './DropdownSection'

const storyConfig: Meta = {
    title: 'General/Dropdown/DropdownSection',
    component: DropdownSection,
}

const DefaultTemplate: StoryObj<typeof DropdownSection> = {
    render: function DefaultTemplate(props) {
        return (
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
    },
}

const ExampleTemplate: StoryObj<typeof DropdownSection> = {
    render: function ExampleTemplate(props) {
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
    },
}

export const Default = {
    ...DefaultTemplate,
    args: {
        children: <div>Bar</div>,
        title: 'Foo',
    },
}

export const Example = {
    ...ExampleTemplate,
    args: {
        title: 'Foo',
    },
}

export default storyConfig
