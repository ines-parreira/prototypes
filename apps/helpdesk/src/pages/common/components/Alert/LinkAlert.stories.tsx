import type { ComponentProps } from 'react'

import { BrowserRouter } from 'react-router-dom'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import LinkAlert from './LinkAlert'

const storyConfig: Meta = {
    title: 'Feedback/LinkAlert',
    component: LinkAlert,
    decorators: [(story) => <BrowserRouter>{story()}</BrowserRouter>],
    globals: {
        backgrounds: {
            value: 'grey',
        },
    },
    parameters: {
        docs: {
            description: {
                component: `<p>
                  Alert component for displaying contextual feedback with an actionable link.
                  <br/>
                  <small>The demo code is wrapped in a router for demonstration purposes, as a ReactRouter Link component is used internally for the link Action.</small>
                  <br/>
                  <small><strong>You don't need to wrap the Alert when using it!</strong></small>
                </p>`,
            },
        },
    },
    argTypes: {
        type: {
            control: {
                type: 'select',
            },
        },
        actionLabel: {
            description: 'Label of the action link.',
        },
        actionHref: {
            description:
                'Route or href for the link. The component will auto-detect if you use an internal or an external link.',
        },
        onAction: {
            description: 'Custom action click event handler.',
        },
    },
}

const Template: StoryObj<typeof LinkAlert> = {
    render: function Template(props) {
        return <LinkAlert {...props} />
    },
}

const defaultProps: ComponentProps<typeof LinkAlert> = {
    children: 'This is an alert !',
    actionLabel: 'Click me',
}

export const Info = {
    ...Template,
    args: defaultProps,
}

export const ActionLink = {
    ...Template,
    args: {
        ...defaultProps,
        actionHref: 'https://www.gorgias.com',
    },
}

export const ActionWithActionHandler = {
    ...Template,
    args: {
        ...defaultProps,
        actionLabel: 'Click me',
    },
}

export default storyConfig
