import type { ComponentProps } from 'react'
import React, { useRef, useState } from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { Button } from '@gorgias/axiom'

import Popover from './Popover'

const storyConfig: Meta = {
    title: 'General/Popover',
    component: Popover,
    argTypes: {
        footer: {
            description: 'Custom footer',
            control: { type: 'text' },
        },
    },
}

const Template: StoryFn<ComponentProps<typeof Popover>> = ({
    children,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    return (
        <div>
            <Button onClick={() => setIsOpen(!isOpen)} ref={buttonRef}>
                Click me
            </Button>

            <Popover
                {...props}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                target={buttonRef}
            >
                {children}
            </Popover>
        </div>
    )
}

const defaultProps: Partial<ComponentProps<typeof Popover>> = {
    children: 'Confirm this action by clicking on the button below',
}

export const DefaultPopover = Template.bind({})
DefaultPopover.args = { ...defaultProps }

export default storyConfig
