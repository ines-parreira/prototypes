import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import CheckBox from 'pages/common/forms/CheckBox'
import InputField from 'pages/common/forms/input/InputField'

import Accordion from './Accordion'
import AccordionBody from './AccordionBody'
import AccordionHeader from './AccordionHeader'
import AccordionItem from './AccordionItem'

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

const Template: StoryObj<typeof Accordion> = {
    render: function Template(props) {
        return <Accordion {...props} />
    },
}

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

export const Default = {
    ...Template,
    args: {
        ...defaultProps,
    },
}

export const WithDefaultExpandedItem = {
    ...Template,
    args: {
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
    },
}

export const WithDisabledItem = {
    ...Template,
    args: {
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
    },
}

export const WithToggleInput = {
    ...Template,
    args: {
        children: (
            <>
                <AccordionItem>
                    <AccordionHeader>
                        <ToggleField value={true} />
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
                        <ToggleField value={true} />
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
                        <ToggleField value={false} />
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
    },
}

export const WithInput = {
    ...Template,
    args: {
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
    },
}

export const WithAction = {
    ...Template,
    args: {
        children: (
            <>
                <AccordionItem>
                    <AccordionHeader
                        action={<CheckBox style={{ marginLeft: 20 }} />}
                    >
                        Header 1
                    </AccordionHeader>
                    <AccordionBody>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Suspendisse malesuada lacus ex, sit amet blandit leo
                        lobortis eget.
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem>
                    <AccordionHeader
                        action={<CheckBox style={{ marginLeft: 20 }} />}
                    >
                        Header 2
                    </AccordionHeader>
                    <AccordionBody>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Suspendisse malesuada lacus ex, sit amet blandit leo
                        lobortis eget.
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem>
                    <AccordionHeader
                        action={<CheckBox style={{ marginLeft: 20 }} />}
                    >
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
    },
}

export default storyConfig
