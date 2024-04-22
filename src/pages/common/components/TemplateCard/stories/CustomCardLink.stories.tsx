import {Meta, StoryObj} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {MemoryRouter} from 'react-router-dom'

import TicketTag from 'pages/common/components/TicketTag'

import {default as CustomCardLinkComponent} from '../CustomCardLink'

const storyConfig: Meta = {
    title: 'General/TemplateCard/CustomCardLink',
    component: CustomCardLinkComponent,
    parameters: {
        docs: {
            description: {
                component:
                    'Custom card, usually the last one in the list and leads to another page with an empty form',
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
                TicketTag: <TicketTag>Category</TicketTag>,
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

const defaultProps: ComponentProps<typeof CustomCardLinkComponent> = {
    title: 'Custom Flow',
    description: 'Create a custom Flow from scratch to fit your needs',
    to: '#',
}

type CustomCardLinkStory = StoryObj<typeof CustomCardLinkComponent>

export const CustomCardLink: CustomCardLinkStory = {
    args: defaultProps,
}

export default storyConfig
