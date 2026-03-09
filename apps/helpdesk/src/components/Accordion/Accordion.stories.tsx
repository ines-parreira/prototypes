import type { ComponentProps } from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { Accordion } from './Accordion'

const storyConfig: Meta = {
    title: 'General/Headless Accordion',
    component: Accordion.Root,
    argTypes: {},
}

const Template: StoryFn<ComponentProps<typeof Accordion.Root>> = (props) => {
    return (
        <Accordion.Root {...props}>
            <Accordion.Item value="item-1">
                <Accordion.ItemTrigger>
                    <div>Item 1</div>
                    <Accordion.ItemIndicator>v</Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent style={{ border: '1px solid red' }}>
                    <div style={{ padding: '10px' }}>Hello</div>
                </Accordion.ItemContent>
            </Accordion.Item>
            <Accordion.Item value="item-2">
                <Accordion.ItemTrigger>
                    <div>Item 2</div>
                    <Accordion.ItemIndicator>v</Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent style={{ border: '1px solid blue' }}>
                    <div style={{ padding: '10px' }}>Hello</div>
                </Accordion.ItemContent>
            </Accordion.Item>
        </Accordion.Root>
    )
}

const defaultProps: Partial<ComponentProps<typeof Accordion.Root>> = {}

export const DefaultAccordion = Template.bind({})
DefaultAccordion.args = { ...defaultProps }

export default storyConfig
