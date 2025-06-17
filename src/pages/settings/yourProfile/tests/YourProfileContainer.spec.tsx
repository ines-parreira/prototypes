import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { AnyAction, Store } from 'redux'

import { UserRole } from 'config/types/user'
import { StoreState } from 'state/types'

import YourProfileContainer from '../YourProfileContainer'

// Mock the YourProfileView component
jest.mock('../components/YourProfileView', () => ({
    YourProfileView: ({
        currentUser,
        preferences,
        isGorgiasAgent,
    }: {
        currentUser: any
        preferences: any
        isGorgiasAgent: boolean
    }) => (
        <div data-testid="your-profile-view">
            <div data-testid="is-gorgias-agent">
                {isGorgiasAgent.toString()}
            </div>
            <div data-testid="current-user">
                {JSON.stringify(currentUser.toJS())}
            </div>
            <div data-testid="preferences">{JSON.stringify(preferences)}</div>
        </div>
    ),
}))

describe('YourProfileContainer', () => {
    const mockStore = {
        getState: () => ({
            currentUser: fromJS({
                role: { name: UserRole.GorgiasAgent },
                name: 'Test User',
                email: 'test@example.com',
                bio: 'Test bio',
                timezone: 'UTC',
                language: 'en',
                settings: {},
                meta: {},
                _internal: 'some internal data',
            }),
        }),
        subscribe: jest.fn(),
        dispatch: jest.fn(),
        replaceReducer: jest.fn(),
        [Symbol.observable]: jest.fn(),
    } as unknown as Store<StoreState, AnyAction>

    const renderComponent = () => {
        return render(
            <Provider store={mockStore}>
                <YourProfileContainer />
            </Provider>,
        )
    }

    it('renders YourProfileView with correct props', () => {
        renderComponent()

        expect(screen.getByTestId('your-profile-view')).toBeInTheDocument()
        expect(screen.getByTestId('is-gorgias-agent')).toHaveTextContent('true')

        const currentUserData = JSON.parse(
            screen.getByTestId('current-user').textContent || '{}',
        )
        expect(currentUserData).toEqual({
            name: 'Test User',
            email: 'test@example.com',
            bio: 'Test bio',
            timezone: 'UTC',
            language: 'en',
            settings: {},
            meta: {},
        })
    })

    it('correctly identifies non-Gorgias agent', () => {
        const nonAgentStore = {
            ...mockStore,
            getState: () => ({
                currentUser: fromJS({
                    role: { name: 'other_role' },
                    name: 'Test User',
                    email: 'test@example.com',
                }),
            }),
        } as unknown as Store<StoreState, AnyAction>

        render(
            <Provider store={nonAgentStore}>
                <YourProfileContainer />
            </Provider>,
        )

        expect(screen.getByTestId('is-gorgias-agent')).toHaveTextContent(
            'false',
        )
    })

    it('handles empty currentUser data', () => {
        const emptyStore = {
            ...mockStore,
            getState: () => ({
                currentUser: fromJS({}),
            }),
        } as unknown as Store<StoreState, AnyAction>

        render(
            <Provider store={emptyStore}>
                <YourProfileContainer />
            </Provider>,
        )

        const currentUserData = JSON.parse(
            screen.getByTestId('current-user').textContent || '{}',
        )
        expect(currentUserData).toEqual({})
    })
})
