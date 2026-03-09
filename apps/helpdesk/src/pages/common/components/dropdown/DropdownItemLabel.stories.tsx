import { useRef, useState } from 'react'

import _noop from 'lodash/noop'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Button } from '@gorgias/axiom'

import Dropdown from './Dropdown'
import DropdownBody from './DropdownBody'
import DropdownItem from './DropdownItem'
import DropdownItemLabel from './DropdownItemLabel'

const storyConfig: Meta = {
    title: 'General/Dropdown/DropdownItemLabel',
    component: DropdownItemLabel,
}

const DefaultTemplate: StoryObj<typeof DropdownItemLabel> = {
    render: function DefaultTemplate(props) {
        return <DropdownItemLabel {...props} />
    },
}

const ExampleTemplate: StoryObj<typeof DropdownItemLabel> = {
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
    },
}

const defaultProps = {
    caption: 'A delicious, nutritive and GMO free meal',
    children: 'Tacos & Burritos',
    prefix: <i className="material-icons">add</i>,
    suffix: (
        <i
            className="material-icons"
            style={{ color: '#99A5B6', lineHeight: '37px' }}
        >
            chevron_right
        </i>
    ),
}

export const Default = {
    ...DefaultTemplate,
    args: defaultProps,
}

export const Example = {
    ...ExampleTemplate,
    args: defaultProps,
}

export default storyConfig
