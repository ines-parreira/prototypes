import React from 'react'

import { flushPromises, render } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import { useGetActionsApp } from 'models/workflows/queries'
import type { RootState } from 'state/types'

import ActionsPlatformEditAppFormView from '../ActionsPlatformEditAppFormView'
import useApps from '../hooks/useApps'
import useEditActionsApp from '../hooks/useEditActionsApp'

jest.mock('models/workflows/queries')
jest.mock('../hooks/useEditActionsApp')
jest.mock('../hooks/useApps')

const storeState = {
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
} as RootState

const LocationPath = () => {
    const location = useLocation()

    return <div aria-label="Current path">{location.pathname}</div>
}

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
        render(<ActionsPlatformEditAppFormView />, { storeState })

        expect(screen.getByText('Actions platform')).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })

    it('should edit app settings', async () => {
        render(<ActionsPlatformEditAppFormView />, { storeState })

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
        await flushPromises()

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
    })

    it('should disable submit button if edit Actions app is submitting', async () => {
        mockUseEditActionsApp.mockReturnValue({
            isLoading: true,
            editActionsApp: mockEditActionsApp,
        } as unknown as ReturnType<typeof mockUseEditActionsApp>)

        render(<ActionsPlatformEditAppFormView />, { storeState })

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
        mockUseGetActionsApp.mockReturnValue({
            data: null,
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetActionsApp>)

        render(
            <>
                <LocationPath />
                <ActionsPlatformEditAppFormView />
            </>,
            { storeState },
        )

        expect(screen.getByLabelText('Current path')).toHaveTextContent(
            '/app/ai-agent/actions-platform/apps',
        )
    })
})
