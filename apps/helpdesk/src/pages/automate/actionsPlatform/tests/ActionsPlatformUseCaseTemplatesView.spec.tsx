import React from 'react'

import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { IntegrationType } from 'models/integration/constants'
import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import ActionsPlatformUseCaseTemplatesView from '../ActionsPlatformUseCaseTemplatesView'
import useApps from '../hooks/useApps'
import useDeleteActionTemplate from '../hooks/useDeleteActionTemplate'

jest.mock('models/workflows/queries')
jest.mock('hooks/useGetDateAndTimeFormat')
jest.mock('../hooks/useApps')
jest.mock('../hooks/useDeleteActionTemplate')

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])({
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
} as RootState)

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const mockUseApps = jest.mocked(useApps)
const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)
const mockUseDeleteActionTemplate = jest.mocked(useDeleteActionTemplate)

mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
    data: [
        {
            id: '1',
            name: 'test1',
            apps: [{ type: 'shopify' }],
            updated_datetime: '2024-08-02T08:18:51.611Z',
            category: 'orders',
        },
        {
            id: '2',
            name: 'test2',
            apps: [{ type: 'recharge' }],
            updated_datetime: '2024-08-01T08:18:51.611Z',
            category: 'orders',
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
mockUseApps.mockReturnValue({
    apps: [
        {
            icon: '/assets/img/integrations/shopify.png',
            id: 'shopify',
            name: 'Shopify',
            type: IntegrationType.Shopify,
        },
        {
            icon: '/assets/img/integrations/recharge.svg',
            id: 'recharge',
            name: 'Recharge',
            type: IntegrationType.Recharge,
        },
        {
            icon: '/assets/img/integrations/app.png',
            id: 'someid',
            name: 'Test App',
            type: IntegrationType.App,
        },
    ],
    isLoading: false,
    actionsApps: [],
})
mockUseGetDateAndTimeFormat.mockReturnValue('MM/DD/YYYY')
mockUseDeleteActionTemplate.mockReturnValue({
    isLoading: false,
    deleteActionTemplate: jest.fn(),
})

describe('<ActionsPlatformUseCaseTemplatesView />', () => {
    it('should render actions platform templates page', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformUseCaseTemplatesView />{' '}
            </Provider>,
        )

        expect(
            screen.getByText(
                'Create, customize and maintain Action templates for AI Agent.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('test1')).toBeInTheDocument()
        expect(screen.getByText('test2')).toBeInTheDocument()
    })

    it('should filter templates by app', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformUseCaseTemplatesView />
            </Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('Select value...'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Recharge'))
        })

        expect(screen.queryByText('test1')).not.toBeInTheDocument()
        expect(screen.getByText('test2')).toBeInTheDocument()
    })

    it('should filter templates by name', async () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformUseCaseTemplatesView />
            </Provider>,
        )

        act(() => {
            fireEvent.change(screen.getByPlaceholderText('Search name'), {
                target: {
                    value: 'test1',
                },
            })
        })

        await waitFor(() => {
            expect(screen.getByText('test1')).toBeInTheDocument()
            expect(screen.queryByText('test2')).not.toBeInTheDocument()
        })
    })

    it('should show only relevant apps in app filter', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformUseCaseTemplatesView />
            </Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('Select value...'))
        })

        expect(screen.queryByText('Test App')).not.toBeInTheDocument()
    })
})
