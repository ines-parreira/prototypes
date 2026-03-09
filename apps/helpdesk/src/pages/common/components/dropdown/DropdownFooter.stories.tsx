import { useRef, useState } from 'react'

import _noop from 'lodash/noop'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { LegacyButton as Button } from '@gorgias/axiom'

import Dropdown from './Dropdown'
import DropdownBody from './DropdownBody'
import DropdownFooter from './DropdownFooter'
import DropdownItem from './DropdownItem'

const storyConfig: Meta = {
    title: 'General/Dropdown/DropdownFooter',
    component: DropdownFooter,
}

const DefaultTemplate: StoryObj<typeof DropdownFooter> = {
    render: function DefaultTemplate(props) {
        return <DropdownFooter {...props} />
    },
}

const ExampleTemplate: StoryObj<typeof DropdownFooter> = {
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
    },
}

export const Default = {
    ...DefaultTemplate,
    args: {
        children: <Button fillStyle="ghost">Foo bar</Button>,
    },
}

export const Example = {
    ...ExampleTemplate,
    args: {
        children: <Button fillStyle="ghost">Foo bar</Button>,
    },
}

export default storyConfig
