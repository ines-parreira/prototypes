import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import ToggleInput from 'pages/common/forms/ToggleInput'
import InputField from 'pages/common/forms/input/InputField'
import CheckBox from 'pages/common/forms/CheckBox'

import Accordion from './Accordion'
import AccordionItem from './AccordionItem'
import AccordionHeader from './AccordionHeader'
import AccordionBody from './AccordionBody'

const storyConfig: Meta = {
    title: 'General/Accordion/Accordion',
    component: Accordion,
    argTypes: {
        children: {
            table: {
                disable: true,
            },
        },
        defaultExpandedItem: {
            description:
                'Id of the expanded accordion item (by default ids for accordion items are randomly generated, so you need to pass a custom id to the accordion item you want to expand)',
            control: {
                type: 'text',
            },
        },
        expandedItem: {
            control: {
                type: 'text',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof Accordion>> = (props) => (
    <Accordion {...props} />
)

const defaultProps: Partial<ComponentProps<typeof Accordion>> = {
    children: (
        <>
            <AccordionItem>
                <AccordionHeader>Header 1</AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem>
                <AccordionHeader>Header 2</AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem>
                <AccordionHeader>Header 3</AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
        </>
    ),
}

export const Default = Template.bind({})
Default.args = {
    ...defaultProps,
}

export const WithDefaultExpandedItem = Template.bind({})
WithDefaultExpandedItem.args = {
    children: (
        <>
            <AccordionItem>
                <AccordionHeader>Header 1</AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem id="2">
                <AccordionHeader>Header 2</AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem>
                <AccordionHeader>Header 3</AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
        </>
    ),
    defaultExpandedItem: '2',
}

export const WithDisabledItem = Template.bind({})
WithDisabledItem.args = {
    children: (
        <>
            <AccordionItem isDisabled>
                <AccordionHeader>Header 1</AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem>
                <AccordionHeader>Header 2</AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem>
                <AccordionHeader>Header 3</AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
        </>
    ),
}

export const WithToggleInput = Template.bind({})
WithToggleInput.args = {
    children: (
        <>
            <AccordionItem>
                <AccordionHeader>
                    <ToggleInput isToggled />
                    Header 1
                </AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem>
                <AccordionHeader>
                    <ToggleInput isToggled />
                    Header 2
                </AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem>
                <AccordionHeader>
                    <ToggleInput isToggled={false} />
                    Header 3
                </AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
        </>
    ),
}

export const WithInput = Template.bind({})
WithInput.args = {
    children: (
        <>
            <AccordionItem>
                <AccordionHeader>
                    <InputField className="flex-grow-1" />
                </AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem>
                <AccordionHeader>
                    <InputField className="flex-grow-1" />
                </AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem>
                <AccordionHeader>
                    <InputField className="flex-grow-1" />
                </AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
        </>
    ),
}

export const WithAction = Template.bind({})
WithAction.args = {
    children: (
        <>
            <AccordionItem>
                <AccordionHeader action={<CheckBox style={{marginLeft: 20}} />}>
                    Header 1
                </AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem>
                <AccordionHeader action={<CheckBox style={{marginLeft: 20}} />}>
                    Header 2
                </AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
            <AccordionItem>
                <AccordionHeader action={<CheckBox style={{marginLeft: 20}} />}>
                    Header 3
                </AccordionHeader>
                <AccordionBody>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                </AccordionBody>
            </AccordionItem>
        </>
    ),
}

export default storyConfig
