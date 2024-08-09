import React from 'react'
import {act, fireEvent, screen, waitFor} from '@testing-library/react'

import {createMemoryHistory} from 'history'
import {useListActionsApps} from 'models/workflows/queries'
import {useGetApps} from 'models/integration/queries'
import {dummyAppListData} from 'fixtures/apps'
import {flushPromises, renderWithRouter} from 'utils/testing'

import useCreateActionsApp from '../hooks/useCreateActionsApp'
import ActionsPlatformCreateAppFormView from '../ActionsPlatformCreateAppFormView'

jest.mock('models/workflows/queries')
jest.mock('models/integration/queries')
jest.mock('../hooks/useCreateActionsApp')

const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseGetApps = jest.mocked(useGetApps)
const mockUseCreateActionsApp = jest.mocked(useCreateActionsApp)
const mockCreateActionsApp = jest.fn()

mockUseListActionsApps.mockReturnValue({
    data: [
        {
            id: 'someid2',
            auth_type: 'api-key',
            auth_settings: {
                url: 'https://example.com',
            },
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useListActionsApps>)
mockUseGetApps.mockReturnValue({
    data: [
        dummyAppListData,
        {
            app_icon: 'https://ok.com/2.png',
            headline: 'Some tagline here',
            categories: [],
            id: 'someid2',
            name: 'My test app 2',
            is_installed: false,
            is_featured: false,
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useGetApps>)

describe('<ActionsPlatformCreateAppFormView />', () => {
    beforeEach(() => {
        mockUseCreateActionsApp.mockReturnValue({
            isLoading: false,
            createActionsApp: mockCreateActionsApp,
        } as unknown as ReturnType<typeof mockUseCreateActionsApp>)
    })

    it('should render create app form', () => {
        renderWithRouter(<ActionsPlatformCreateAppFormView />)

        expect(screen.getByText('Actions platform')).toBeInTheDocument()
        expect(screen.getByText('Create App settings')).toBeInTheDocument()
    })

    it('should create new app settings', async () => {
        const history = createMemoryHistory()

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(<ActionsPlatformCreateAppFormView />, {history})

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
            {id: dummyAppListData.id},
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
        renderWithRouter(<ActionsPlatformCreateAppFormView />)

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

        renderWithRouter(<ActionsPlatformCreateAppFormView />)

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
