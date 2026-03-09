import type { ComponentProps } from 'react'
import React from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TicketTag from 'pages/common/components/TicketTag'

import { default as CustomCardComponent } from '../CustomCard'

const storyConfig: Meta = {
    title: 'General/TemplateCard/CustomCard',
    component: CustomCardComponent,
    parameters: {
        docs: {
            description: {
                component:
                    'Custom card, usually the last one in the list and leads to an empty form via a callback that would open a modal or a side panel',
            },
        },
    },
    argTypes: {
        description: {
            description: 'Describes the template',
        },
        icon: {
            description: 'Provides an optional top-left icon',
            options: [
                'null',
                'add_circle icon',
                'people icon',
                'outbound icon',
            ],
            mapping: {
                null: null,
                'add_circle icon': <i className="material-icons">add_circle</i>,
                'people icon': <i className="material-icons">people</i>,
                'outbound icon': <i className="material-icons">outbound</i>,
            },
        },
        onClick: {
            action: 'Custom card clicked',
            table: {
                disable: true,
            },
        },
        tag: {
            description:
                'Provides an optional top-left tag to specify the category of your template',
            options: ['null', 'TicketTag'],
            mapping: {
                null: null,
                TicketTag: <TicketTag text="Category" />,
            },
        },
        title: {
            description: 'Name of the template',
        },
    },
}

const defaultProps: ComponentProps<typeof CustomCardComponent> = {
    title: 'Custom Flow',
    description: 'Create a custom Flow from scratch to fit your needs',
}

type CustomCardStory = StoryObj<typeof CustomCardComponent>

export const CustomCard: CustomCardStory = {
    args: defaultProps,
}

export default storyConfig
