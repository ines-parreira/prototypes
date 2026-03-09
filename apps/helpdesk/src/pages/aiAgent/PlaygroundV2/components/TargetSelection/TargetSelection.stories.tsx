import type { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { appQueryClient } from 'api/queryClient'
import { user } from 'fixtures/users'

import { TargetSelection } from './TargetSelection'

const defaultState = {
    currentUser: Map(user),
}

const storyConfig: Meta = {
    title: 'AI Agent/PlaygroundV2/TargetSelection',
    component: TargetSelection,
    argTypes: {
        customer: {
            description: 'The customer object containing email, name, and id',
            control: { type: 'object' },
        },
        onChange: {
            description: 'Callback fired when the target selection changes',
            action: 'onChange',
        },
    },
    decorators: [
        (story) => (
            <Provider store={configureMockStore()(defaultState)}>
                <QueryClientProvider client={appQueryClient}>
                    {story()}
                </QueryClientProvider>
            </Provider>
        ),
    ],
}

const defaultProps: ComponentProps<typeof TargetSelection> = {
    customer: {
        email: 'customer@example.com',
        name: 'John Doe',
        id: 12345,
    },
    onChange: (__) => {},
}

const Template: StoryFn<ComponentProps<typeof TargetSelection>> = (args) => {
    return (
        <div style={{ maxWidth: '500px', padding: '20px' }}>
            <TargetSelection {...args} />
        </div>
    )
}

export const Default = Template.bind({})
Default.args = { ...defaultProps }

export default storyConfig
