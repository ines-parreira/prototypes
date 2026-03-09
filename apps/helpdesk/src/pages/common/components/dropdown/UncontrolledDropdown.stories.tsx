import { useRef } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Button } from '@gorgias/axiom'

import UncontrolledDropdown from './UncontrolledDropdown'

const storyConfig: Meta = {
    title: 'General/Dropdown/UncontrolledDropdown',
    component: UncontrolledDropdown,
}

const ExampleTemplate: StoryObj<typeof UncontrolledDropdown> = {
    render: function ExampleTemplate(props) {
        const buttonRef = useRef<HTMLButtonElement>(null)

        return (
            <>
                <Button ref={buttonRef}>Click me</Button>
                <UncontrolledDropdown {...props} target={buttonRef}>
                    Hello
                </UncontrolledDropdown>
            </>
        )
    },
}

export const Example = {
    ...ExampleTemplate,
    parameters: { controls: { include: ['placement'] } },
}

export default storyConfig
