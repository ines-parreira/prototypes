import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {Map} from 'immutable'

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
    parameters: {
        docs: {
            description: {
                component:
                    'Component for displaying tips.<br/>The tip is meant to be hidden after the user has closed it once. For this, the component sets a key for the user in localStorage.',
            },
        },
        backgrounds: {default: 'grey'},
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

const Template: Story<ComponentProps<typeof Tip>> = (props) => (
    <Tip {...props} />
)

const defaultProps: ComponentProps<typeof Tip> = {
    storageKey: 'default',
    actionLabel: 'Got It',
    children: 'This is a tip!',
}
export const Info = Template.bind({})
Info.args = {...defaultProps}

export const WithIcon = Template.bind({})
WithIcon.args = {...defaultProps, icon: true}

export default storyConfig
