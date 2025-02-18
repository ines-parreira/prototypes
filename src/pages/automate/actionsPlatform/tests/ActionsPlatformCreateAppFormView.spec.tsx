import {act, fireEvent, screen, waitFor} from '@testing-library/react'

import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import React from 'react'

import {Provider} from 'react-redux'

import configureMockStore from 'redux-mock-store'

import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'

import {flushPromises, renderWithRouter} from 'utils/testing'

import ActionsPlatformCreateAppFormView from '../ActionsPlatformCreateAppFormView'
import useApps from '../hooks/useApps'
import useCreateActionsApp from '../hooks/useCreateActionsApp'

jest.mock('models/integration/queries')
jest.mock('../hooks/useCreateActionsApp')
jest.mock('../hooks/useApps')

const mockUseApps = jest.mocked(useApps)
const mockUseCreateActionsApp = jest.mocked(useCreateActionsApp)
const mockCreateActionsApp = jest.fn()

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])({
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
} as RootState)

mockUseApps.mockReturnValue({
    apps: [
        {
            icon: 'https://ok.com/1.png',
            id: 'someid',
            name: 'My test app',
            type: 'app',
        },
        {
            icon: 'https://ok.com/2.png',
            id: 'someid2',
            name: 'My test app 2',
            type: 'app',
        },
    ],
    actionsApps: [
        {
            id: 'someid2',
            auth_type: 'api-key',
            auth_settings: {
                url: 'https://example.com',
            },
        },
    ],
    isLoading: false,
} as unknown as ReturnType<typeof useApps>)

describe('<ActionsPlatformCreateAppFormView />', () => {
    beforeEach(() => {
        mockUseCreateActionsApp.mockReturnValue({
            isLoading: false,
            createActionsApp: mockCreateActionsApp,
        } as unknown as ReturnType<typeof mockUseCreateActionsApp>)
    })

    it('should render create app form', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformCreateAppFormView />
            </Provider>
        )

        expect(screen.getByText('Actions platform')).toBeInTheDocument()
        expect(screen.getByText('Create App settings')).toBeInTheDocument()
    })

    it('should create new app settings', async () => {
        const history = createMemoryHistory()

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformCreateAppFormView />
            </Provider>,
            {history}
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select an App'))
        })

        act(() => {
            fireEvent.click(screen.getByText('My test app'))
        })

        act(() => {
            fireEvent.change(
                screen.getByPlaceholderText('https://link.gorgias.com/xyz'),
                {
                    target: {value: 'https://example.com'},
                }
            )
        })

        await flushPromises()

        act(() => {
            fireEvent.click(screen.getByText('Create App settings'))
        })

        expect(mockCreateActionsApp).toHaveBeenCalledWith([
            {id: 'someid'},
            {
                id: 'someid',
                auth_type: 'api-key',
                auth_settings: {
                    url: 'https://example.com',
                },
            },
        ])
        await waitFor(() => {
            expect(historyPushSpy).toHaveBeenCalledWith(
                '/app/automation/actions-platform/apps'
            )
        })
    })

    it('should filter out already used apps', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformCreateAppFormView />
            </Provider>
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select an App'))
        })

        expect(screen.getByText('My test app')).toBeInTheDocument()
        expect(screen.queryByText('My test app 2')).not.toBeInTheDocument()
    })

    it('should disable submit button if create Actions app is submitting', async () => {
        mockUseCreateActionsApp.mockReturnValue({
            isLoading: true,
            createActionsApp: mockCreateActionsApp,
        } as unknown as ReturnType<typeof mockUseCreateActionsApp>)

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformCreateAppFormView />
            </Provider>
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select an App'))
        })

        act(() => {
            fireEvent.click(screen.getByText('My test app'))
        })

        act(() => {
            fireEvent.change(
                screen.getByPlaceholderText('https://link.gorgias.com/xyz'),
                {
                    target: {value: 'https://example.com'},
                }
            )
        })

        await flushPromises()

        act(() => {
            fireEvent.click(screen.getByText('Create App settings'))
        })

        expect(mockCreateActionsApp).not.toHaveBeenCalled()
    })
})
