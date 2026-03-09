import type { ComponentProps } from 'react'
import React from 'react'

import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TicketTag from 'pages/common/components/TicketTag'

import { default as TemplateCardLinkComponent } from '../TemplateCardLink'

const storyConfig: Meta = {
    title: 'General/TemplateCard/TemplateCardLink',
    component: TemplateCardLinkComponent,
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
    decorators: [
        (Component) => (
            <MemoryRouter>
                <Component />
            </MemoryRouter>
        ),
    ],
}

const defaultProps: ComponentProps<typeof TemplateCardLinkComponent> = {
    buttonLabel: 'Preview',
    description:
        'Ask customers questions and recommend specific products based on their answers.',
    icon: <i className="material-icons">people</i>,
    title: 'Product recommendation',
    to: '#',
}

type TemplateCardLinkStory = StoryObj<typeof TemplateCardLinkComponent>

export const TemplateCardLink: TemplateCardLinkStory = {
    args: defaultProps,
    parameters: {
        docs: {
            description: {
                story: 'Expects a link that would redirect the user to another page containing the template',
            },
        },
    },
}

export default storyConfig
