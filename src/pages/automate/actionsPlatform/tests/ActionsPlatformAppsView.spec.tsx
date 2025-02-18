import {act, fireEvent, screen, waitFor} from '@testing-library/react'

import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {IntegrationType} from 'models/integration/constants'
import {RootState, StoreDispatch} from 'state/types'

import {renderWithRouter} from 'utils/testing'

import ActionsPlatformAppsView from '../ActionsPlatformAppsView'
import useApps from '../hooks/useApps'

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])({
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
} as RootState)

jest.mock('models/workflows/queries')
jest.mock('../hooks/useApps')

const mockUseApps = jest.mocked(useApps)

mockUseApps.mockReturnValue({
    apps: [
        {
            icon: '/assets/img/integrations/app1.png',
            id: '1',
            name: 'App 1',
            type: IntegrationType.App,
        },
        {
            icon: '/assets/img/integrations/app2.svg',
            id: '2',
            name: 'App 2',
            type: IntegrationType.App,
        },
    ],
    isLoading: false,
    actionsApps: [
        {
            id: '1',
            auth_type: 'api-key',
            auth_settings: {
                url: '',
            },
        },
        {
            id: '2',
            auth_type: 'api-key',
            auth_settings: {
                url: '',
            },
        },
    ],
})

describe('<ActionsPlatformAppsView />', () => {
    it('should render actions platform apps page', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformAppsView />
            </Provider>
        )

        expect(
            screen.getByText(
                'Maintain authentication method settings for 3rd party Apps.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('App 1')).toBeInTheDocument()
        expect(screen.getByText('App 2')).toBeInTheDocument()
    })

    it('should filter apps by name', async () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformAppsView />
            </Provider>
        )

        act(() => {
            fireEvent.change(screen.getByPlaceholderText('Search name'), {
                target: {
                    value: 'App 1',
                },
            })
        })

        await waitFor(() => {
            expect(screen.getByText('App 1')).toBeInTheDocument()
            expect(screen.queryByText('App 2')).not.toBeInTheDocument()
        })
    })

    it('should redirect to new App settings form on CTA click', () => {
        const history = createMemoryHistory()

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformAppsView />
            </Provider>,
            {history}
        )

        act(() => {
            fireEvent.click(screen.getByText('Create App settings'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/actions-platform/apps/new'
        )
    })

    it('should redirect to existing App settings form on row click', () => {
        const history = createMemoryHistory()

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformAppsView />
            </Provider>,
            {history}
        )

        act(() => {
            fireEvent.click(screen.getByText('App 1'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/actions-platform/apps/edit/1'
        )
    })
})
