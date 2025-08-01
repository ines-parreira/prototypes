import React from 'react'

import { flushPromises } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useGetActionsApp } from 'models/workflows/queries'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import ActionsPlatformEditAppFormView from '../ActionsPlatformEditAppFormView'
import useApps from '../hooks/useApps'
import useEditActionsApp from '../hooks/useEditActionsApp'

jest.mock('models/workflows/queries')
jest.mock('../hooks/useEditActionsApp')
jest.mock('../hooks/useApps')

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])({
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
} as RootState)

const mockUseGetActionsApp = jest.mocked(useGetActionsApp)
const mockUseApps = jest.mocked(useApps)
const mockUseEditActionsApp = jest.mocked(useEditActionsApp)
const mockEditActionsApp = jest.fn()

mockUseApps.mockReturnValue({
    apps: [
        {
            icon: 'https://ok.com/1.png',
            id: 'someid',
            name: 'My test app',
            type: 'app',
        },
    ],
    actionsApps: [],
    isLoading: false,
} as unknown as ReturnType<typeof useApps>)

describe('<ActionsPlatformEditAppFormView />', () => {
    beforeEach(() => {
        mockUseGetActionsApp.mockReturnValue({
            data: {
                id: 'someid',
                auth_type: 'api-key',
                auth_settings: {
                    url: 'https://example.com',
                },
            },
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetActionsApp>)
        mockUseEditActionsApp.mockReturnValue({
            isLoading: false,
            editActionsApp: mockEditActionsApp,
        } as unknown as ReturnType<typeof mockUseEditActionsApp>)
    })

    it('should render edit app form', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformEditAppFormView />
            </Provider>,
        )

        expect(screen.getByText('Actions platform')).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })

    it('should edit app settings', async () => {
        const history = createMemoryHistory()

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformEditAppFormView />
            </Provider>,
            { history },
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('https://example.com'), {
                target: { value: 'https://example2.com' },
            })
        })

        await waitFor(() => {
            const saveButton = screen
                .getByText('Save Changes')
                .closest('button')
            expect(saveButton).not.toBeDisabled()
        })

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockEditActionsApp).toHaveBeenCalledWith([
            { id: 'someid' },
            {
                id: 'someid',
                auth_type: 'api-key',
                auth_settings: {
                    url: 'https://example2.com',
                },
            },
        ])
        await waitFor(() => {
            expect(historyPushSpy).toHaveBeenCalledWith(
                '/app/ai-agent/actions-platform/apps',
            )
        })
    })

    it('should disable submit button if edit Actions app is submitting', async () => {
        mockUseEditActionsApp.mockReturnValue({
            isLoading: true,
            editActionsApp: mockEditActionsApp,
        } as unknown as ReturnType<typeof mockUseEditActionsApp>)

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformEditAppFormView />
            </Provider>,
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('https://example.com'), {
                target: { value: 'https://example2.com' },
            })
        })

        await flushPromises()

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockEditActionsApp).not.toHaveBeenCalled()
    })

    it('should redirect to apps page if Actions app is missing', () => {
        const history = createMemoryHistory()

        mockUseGetActionsApp.mockReturnValue({
            data: null,
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetActionsApp>)

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformEditAppFormView />
            </Provider>,
            { history },
        )

        expect(history.location.pathname).toEqual(
            '/app/ai-agent/actions-platform/apps',
        )
    })
})
