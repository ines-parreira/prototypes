import type { ComponentProps } from 'react'
import React from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TicketTag from 'pages/common/components/TicketTag'

import { default as TemplateCardComponent } from '../TemplateCard'

const storyConfig: Meta = {
    title: 'General/TemplateCard/TemplateCard',
    component: TemplateCardComponent,
    parameters: {
        docs: {
            description: {
                component:
                    'Template cards are used mainly as an onboarding to a feature and serves as a guide to provide recommendations to merchants to increase adoption.',
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
            action: 'Template card clicked',
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

const defaultProps: ComponentProps<typeof TemplateCardComponent> = {
    buttonLabel: 'Preview',
    description:
        'Ask customers questions and recommend specific products based on their answers.',
    icon: <i className="material-icons">people</i>,
    title: 'Product recommendation',
}

type TemplateCardStory = StoryObj<typeof TemplateCardComponent>

export const TemplateCard: TemplateCardStory = {
    args: defaultProps,
    parameters: {
        docs: {
            description: {
                story: 'Expects a callback that would trigger the display of the template in a modal or side-panel',
            },
        },
    },
}

export default storyConfig
