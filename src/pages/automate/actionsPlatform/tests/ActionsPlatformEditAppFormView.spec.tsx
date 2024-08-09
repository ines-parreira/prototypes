import React from 'react'
import {act, fireEvent, screen, waitFor} from '@testing-library/react'

import {createMemoryHistory} from 'history'
import {useGetActionsApp} from 'models/workflows/queries'
import {useGetApps} from 'models/integration/queries'
import {dummyAppListData} from 'fixtures/apps'
import {flushPromises, renderWithRouter} from 'utils/testing'

import useEditActionsApp from '../hooks/useEditActionsApp'
import ActionsPlatformEditAppFormView from '../ActionsPlatformEditAppFormView'

jest.mock('models/workflows/queries')
jest.mock('models/integration/queries')
jest.mock('../hooks/useEditActionsApp')

const mockUseGetActionsApp = jest.mocked(useGetActionsApp)
const mockUseGetApps = jest.mocked(useGetApps)
const mockUseEditActionsApp = jest.mocked(useEditActionsApp)
const mockEditActionsApp = jest.fn()

mockUseGetApps.mockReturnValue({
    data: [dummyAppListData],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useGetApps>)

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
        renderWithRouter(<ActionsPlatformEditAppFormView />)

        expect(screen.getByText('Actions platform')).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })

    it('should edit app settings', async () => {
        const history = createMemoryHistory()

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(<ActionsPlatformEditAppFormView />, {history})

        act(() => {
            fireEvent.change(screen.getByDisplayValue('https://example.com'), {
                target: {value: 'https://example2.com'},
            })
        })

        await flushPromises()

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockEditActionsApp).toHaveBeenCalledWith([
            {id: dummyAppListData.id},
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
                '/app/automation/actions-platform/apps'
            )
        })
    })

    it('should disable submit button if edit Actions app is submitting', async () => {
        mockUseEditActionsApp.mockReturnValue({
            isLoading: true,
            editActionsApp: mockEditActionsApp,
        } as unknown as ReturnType<typeof mockUseEditActionsApp>)

        renderWithRouter(<ActionsPlatformEditAppFormView />)

        act(() => {
            fireEvent.change(screen.getByDisplayValue('https://example.com'), {
                target: {value: 'https://example2.com'},
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

        renderWithRouter(<ActionsPlatformEditAppFormView />, {history})

        expect(history.location.pathname).toEqual(
            '/app/automation/actions-platform/apps'
        )
    })
})
