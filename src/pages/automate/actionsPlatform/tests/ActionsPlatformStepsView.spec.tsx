import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {IntegrationType} from 'models/integration/constants'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'

import ActionsPlatformStepsView from '../ActionsPlatformStepsView'
import useApps from '../hooks/useApps'
import useDeleteActionTemplate from '../hooks/useDeleteActionTemplate'

jest.mock('models/workflows/queries')
jest.mock('hooks/useGetDateAndTimeFormat')
jest.mock('../hooks/useApps')
jest.mock('../hooks/useDeleteActionTemplate')

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)
const mockUseApps = jest.mocked(useApps)
const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)
const mockUseDeleteActionTemplate = jest.mocked(useDeleteActionTemplate)

mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
    data: [
        {
            id: '1',
            name: 'test1',
            apps: [{type: 'shopify'}],
            updated_datetime: '2024-08-02T08:18:51.611Z',
        },
        {
            id: '2',
            name: 'test2',
            apps: [{type: 'recharge'}],
            updated_datetime: '2024-08-01T08:18:51.611Z',
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

describe('<ActionsPlatformStepsView />', () => {
    it('should render actions platform ste[s page', () => {
        render(<ActionsPlatformStepsView />)

        expect(
            screen.getByText(
                'Create, customize, publish and maintain reusable Action steps for AI Agent.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('test1')).toBeInTheDocument()
        expect(screen.getByText('test2')).toBeInTheDocument()
    })

    it('should filter steps by app', () => {
        render(<ActionsPlatformStepsView />)

        act(() => {
            fireEvent.click(screen.getByText('Select value...'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Recharge'))
        })

        expect(screen.queryByText('test1')).not.toBeInTheDocument()
        expect(screen.getByText('test2')).toBeInTheDocument()
    })

    it('should filter steps by name', async () => {
        render(<ActionsPlatformStepsView />)

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
        render(<ActionsPlatformStepsView />)

        act(() => {
            fireEvent.click(screen.getByText('Select value...'))
        })

        expect(screen.queryByText('Test App')).not.toBeInTheDocument()
    })
})
