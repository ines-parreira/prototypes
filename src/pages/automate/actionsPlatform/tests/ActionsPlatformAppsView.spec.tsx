import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'

import {createMemoryHistory} from 'history'
import React from 'react'

import {IntegrationType} from 'models/integration/constants'
import {renderWithRouter} from 'utils/testing'

import ActionsPlatformAppsView from '../ActionsPlatformAppsView'
import useApps from '../hooks/useApps'

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
        render(<ActionsPlatformAppsView />)

        expect(
            screen.getByText(
                'Maintain authentication method settings for 3rd party Apps.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('App 1')).toBeInTheDocument()
        expect(screen.getByText('App 2')).toBeInTheDocument()
    })

    it('should filter apps by name', async () => {
        render(<ActionsPlatformAppsView />)

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

        renderWithRouter(<ActionsPlatformAppsView />, {history})

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

        renderWithRouter(<ActionsPlatformAppsView />, {history})

        act(() => {
            fireEvent.click(screen.getByText('App 1'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/actions-platform/apps/edit/1'
        )
    })
})
