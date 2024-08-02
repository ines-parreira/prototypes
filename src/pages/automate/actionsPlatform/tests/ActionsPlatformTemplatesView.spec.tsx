import React from 'react'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'

import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import {IntegrationType} from 'models/integration/constants'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'

import useApps from '../hooks/useApps'
import ActionsPlatformTemplatesView from '../ActionsPlatformTemplatesView'

jest.mock('models/workflows/queries')
jest.mock('hooks/useGetDateAndTimeFormat')
jest.mock('../hooks/useApps')

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)
const mockUseApps = jest.mocked(useApps)
const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)

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
    ],
    isLoading: false,
})
mockUseGetDateAndTimeFormat.mockReturnValue('MM/DD/YYYY')

describe('<ActionsPlatformTemplatesView />', () => {
    it('should render actions platform templates page', () => {
        render(<ActionsPlatformTemplatesView />)

        expect(
            screen.getByText(
                'Create, customize, publish and maintain reusable Actions for AI Agent.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('test1')).toBeInTheDocument()
        expect(screen.getByText('test2')).toBeInTheDocument()
    })

    it('should filter templates by app', () => {
        render(<ActionsPlatformTemplatesView />)

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
        render(<ActionsPlatformTemplatesView />)

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
})
