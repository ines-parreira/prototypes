import type { ReactNode } from 'react'

import { history } from '@repo/routing'
import { render, screen } from '@testing-library/react'
import type { Location } from 'history'
import type { Store } from 'redux'

import activityTracker from 'services/activityTracker'
import type { RootState } from 'state/types'
import type { GorgiasInitialState } from 'types'

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
    ...jest.requireActual('react-router-dom'),
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
jest.mock(
    'pages/common/components/CurrentUserRealtimeAvailabilityUpdates',
    () => ({
        CurrentUserRealtimeAvailabilityUpdates: () => (
            <div>CurrentUserRealtimeAvailabilityUpdates</div>
        ),
    }),
)
jest.mock('@repo/feature-flags', () => ({
    FeatureFlagsProvider: ({ children }: { children: ReactNode }) => (
        <div>
            <p>FeatureFlagsProvider</p>
            {children}
        </div>
    ),
}))

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        listen: jest.fn(),
    },
}))

describe('Root', () => {
    const store = {} as Store<RootState>

    it('should render various providers', () => {
        render(<Root store={store} />)
        screen.getByText('QueryClientProvider')
        screen.getByText('ReduxProvider')
        screen.getByText('DndProvider')
        screen.getByText('FeatureFlagsProvider')
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

    it('should render CurrentUserRealtimeAvailabilityUpdates', () => {
        render(<Root store={store} />)
        expect(
            screen.getByText('CurrentUserRealtimeAvailabilityUpdates'),
        ).toBeInTheDocument()
    })
})
