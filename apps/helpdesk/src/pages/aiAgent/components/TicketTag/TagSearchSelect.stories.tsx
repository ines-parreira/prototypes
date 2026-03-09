import { QueryClientProvider } from '@tanstack/react-query'
import { Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { appQueryClient } from 'api/queryClient'
import { user } from 'fixtures/users'

import TagSearchSelect from './TagSearchSelect'

const defaultState = {
    currentUser: Map(user),
}

const meta: Meta<typeof TagSearchSelect> = {
    title: 'AI Agent/Configuration/Tags/TagSearchSelect',
    component: TagSearchSelect,
    argTypes: {
        onSelect: {
            description: 'What to do when tag is selected',
        },
        defaultTag: {
            description: 'Default selected tag name',
            default: undefined,
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

export default meta

type Story = StoryObj<typeof TagSearchSelect>

export const NoSelectedTag: Story = {
    render: (args) => <TagSearchSelect {...args} />,
    args: {
        onSelect: () => {},
    },
}

export const SelectedTag: Story = {
    render: (args) => <TagSearchSelect {...args} />,
    args: {
        onSelect: () => {},
        defaultTag: 'defaul-tag-name',
    },
}
