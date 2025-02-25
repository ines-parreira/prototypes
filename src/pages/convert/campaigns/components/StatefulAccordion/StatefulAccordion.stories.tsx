import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

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

const Template: Story<ComponentProps<typeof Accordion>> = (props) => (
    <Accordion {...props} />
)

export const Default = Template.bind({})
Default.args = {
    children: (
        <StatefulAccordion title="Set up the basics">
            Lorem ipsum dolor
        </StatefulAccordion>
    ),
}

export const Count = Template.bind({})
Count.args = {
    children: (
        <StatefulAccordion count={1} title="Set up the basics">
            Lorem ipsum dolor
        </StatefulAccordion>
    ),
}

export const Valid = Template.bind({})
Valid.args = {
    children: (
        <StatefulAccordion isValid title="Set up the basics">
            Lorem ipsum dolor
        </StatefulAccordion>
    ),
}

export const Invalid = Template.bind({})
Invalid.args = {
    children: (
        <StatefulAccordion isInvalid title="Set up the basics">
            Lorem ipsum dolor
        </StatefulAccordion>
    ),
}

export default storyConfig
