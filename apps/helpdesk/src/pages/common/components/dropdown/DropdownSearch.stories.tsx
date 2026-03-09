import { useRef, useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Button } from '@gorgias/axiom'

import Dropdown from './Dropdown'
import DropdownSearch from './DropdownSearch'

const storyConfig: Meta = {
    component: DropdownSearch,
    title: 'General/Dropdown/DropdownSearch',
}

const DefaultTemplate: StoryObj<typeof DropdownSearch> = {
    render: function DefaultTemplate(props) {
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
                    <DropdownSearch {...props} />
                </Dropdown>
            </div>
        )
    },
}

export const Default = {
    ...DefaultTemplate,
    args: {
        className: '',
        placeholder: 'Search',
    },
}

export default storyConfig
