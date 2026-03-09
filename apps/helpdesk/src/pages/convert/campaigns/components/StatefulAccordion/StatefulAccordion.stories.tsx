import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import Accordion from 'pages/common/components/accordion/Accordion'

import { StatefulAccordion } from './StatefulAccordion'

const storyConfig: Meta = {
    title: 'Convert/Chat Campaigns/Accordion',
    component: StatefulAccordion,
    argTypes: {
        children: {
            table: {
                disable: true,
            },
        },
    },
}

type Story = StoryObj<typeof StatefulAccordion>

const Template: Story = {
    render: (props) => <Accordion {...props} />,
}

export const Default = {
    ...Template,
    args: {
        children: (
            <StatefulAccordion title="Set up the basics">
                Lorem ipsum dolor
            </StatefulAccordion>
        ),
    },
}

export const Count = {
    ...Template,
    args: {
        children: (
            <StatefulAccordion count={1} title="Set up the basics">
                Lorem ipsum dolor
            </StatefulAccordion>
        ),
    },
}

export const Valid = {
    ...Template,
    args: {
        children: (
            <StatefulAccordion isValid title="Set up the basics">
                Lorem ipsum dolor
            </StatefulAccordion>
        ),
    },
}

export const Invalid = {
    ...Template,
    args: {
        children: (
            <StatefulAccordion isInvalid title="Set up the basics">
                Lorem ipsum dolor
            </StatefulAccordion>
        ),
    },
}

export default storyConfig
