import React, {ComponentProps, useRef, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import Button from 'pages/common/components/button/Button'

import Dropdown from './Dropdown'
import DropdownSearch from './DropdownSearch'

const storyConfig: Meta = {
    component: DropdownSearch,
    title: 'General/Dropdown/DropdownSearch',
}

const DefaultTemplate: Story<ComponentProps<typeof DropdownSearch>> = (
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
                <DropdownSearch {...props} />
            </Dropdown>
        </div>
    )
}

export const Default = DefaultTemplate.bind({})
Default.args = {
    className: '',
    placeholder: 'Search',
}

export default storyConfig
