import type { ReactNode } from 'react'

import { history } from '@repo/routing'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import type { Location } from 'history'
import type { LDClient } from 'launchdarkly-js-client-sdk'
import type { Store } from 'redux'

import activityTracker from 'services/activityTracker'
import type { RootState } from 'state/types'
import type { GorgiasInitialState } from 'types'
import { getLDClient } from 'utils/launchDarkly'

import Root from '../Root'

jest.mock('@tanstack/react-query', () => ({
    QueryClientProvider: ({ children }: { children: ReactNode }) => (
        <div>
            <p>QueryClientProvider</p>
            {children}
        </div>
    ),
}))
jest.mock('react-dnd', () => ({
    DndProvider: ({ children }: { children: ReactNode }) => (
        <div>
            <p>DndProvider</p>
            {children}
        </div>
    ),
}))
jest.mock('react-redux', () => ({
    Provider: ({ children }: { children: ReactNode }) => (
        <div>
            <p>ReduxProvider</p>
            {children}
        </div>
    ),
}))
jest.mock('react-router-dom', () => ({
    Router: ({ children }: { children: ReactNode }) => (
        <div>
            <p>Router</p>
            {children}
        </div>
    ),
}))
jest.mock('react-router-dom-v5-compat', () => ({
    CompatRouter: ({ children }: { children: ReactNode }) => (
        <div>
            <p>CompatRouter</p>
            {children}
        </div>
    ),
}))

jest.mock('main/app', () => ({
    Main: ({ children }: { children: ReactNode }) => (
        <div>
            <p>Main</p>
            {children}
        </div>
    ),
}))
jest.mock('routes', () => () => <div>RoutesWrapper</div>)
jest.mock('services/activityTracker', () => ({ createUserContext: jest.fn() }))
jest.mock('utils/launchDarkly', () => ({
    getLDClient: jest.fn(),
    LDContext: {},
}))
const getLDClientMock = assumeMock(getLDClient)

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        listen: jest.fn(),
    },
}))

describe('Root', () => {
    let waitUntilGoalsReady: jest.Mock
    const store = {} as Store<RootState>

    beforeEach(() => {
        waitUntilGoalsReady = jest.fn(() => new Promise(jest.fn()))
        getLDClientMock.mockReturnValue({
            waitUntilGoalsReady,
        } as unknown as LDClient)
    })

    it('should render various providers', () => {
        render(<Root store={store} />)
        screen.getByText('QueryClientProvider')
        screen.getByText('ReduxProvider')
        screen.getByText('DndProvider')
        screen.getByText('Router')
        screen.getByText('CompatRouter')
        screen.getByText('Main')
        screen.getByText('RoutesWrapper')
    })

    it('should create a user context for the activity tracker', () => {
        window.GORGIAS_STATE = {
            currentAccount: { id: 10 },
            currentUser: { id: 20 },
        } as GorgiasInitialState
        window.CLIENT_ID = '30'
        render(<Root store={store} />)
        expect(history.listen).toHaveBeenCalledWith(expect.any(Function))
        const [[listener]] = (history.listen as jest.Mock).mock.calls as [
            (l: Location) => void,
        ][]

        listener({ pathname: '/app' } as Location)
        expect(activityTracker.createUserContext).toHaveBeenCalledWith({
            accountId: 10,
            clientId: '30',
            userId: 20,
            path: '/app',
        })
    })
})
