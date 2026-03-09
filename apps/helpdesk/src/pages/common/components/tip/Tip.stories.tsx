import type { ComponentProps } from 'react'

import { Map } from 'immutable'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import Tip from './Tip'

const defaultState = {
    currentUser: Map({
        id: Date.now(),
    }),
}

const storyConfig: Meta = {
    title: 'Feedback/Tip',
    component: Tip,
    decorators: [
        (story) => (
            <Provider store={configureMockStore()(defaultState)}>
                <BrowserRouter>{story()}</BrowserRouter>
            </Provider>
        ),
    ],
    globals: {
        backgrounds: {
            value: 'grey',
        },
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Component for displaying tips.<br/>The tip is meant to be hidden after the user has closed it once. For this, the component sets a key for the user in localStorage.',
            },
        },
    },
    argTypes: {
        storageKey: {
            description: 'The key used for localStorage',
        },
        type: {
            control: {
                type: 'select',
            },
        },
        actionLabel: {
            description: 'Label of the action link.',
        },
    },
}

type TemplateProps = ComponentProps<typeof Tip>

const Template: StoryObj<TemplateProps> = {
    render: function Template({ ...props }) {
        return <Tip {...props} />
    },
}

const defaultProps: ComponentProps<typeof Tip> = {
    storageKey: 'default',
    actionLabel: 'Got It',
    children: 'This is a tip!',
}

const templateParameters = {
    controls: {
        include: ['storageKey', 'actionLabel', 'icon'],
    },
}

export const Info = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export const WithIcon = {
    ...Template,
    args: { ...defaultProps, icon: true },
    parameters: templateParameters,
}

export default storyConfig
