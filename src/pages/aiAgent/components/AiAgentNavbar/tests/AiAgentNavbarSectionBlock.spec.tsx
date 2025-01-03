import {render, screen} from '@testing-library/react'
import React, {type ReactNode} from 'react'

import '@testing-library/jest-dom/extend-expect'
import {StaticRouter} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/constants'
import {ShopType} from 'models/selfServiceConfiguration/types'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {useStoreConfiguration} from 'pages/aiAgent/hooks/useStoreConfiguration'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import {AiAgentNavbarSectionBlock} from '../AiAgentNavbarSectionBlock'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('pages/aiAgent/hooks/useStoreConfiguration')
jest.mock('state/currentAccount/selectors')
jest.mock('hooks/useAppSelector')

const mockUseAiAgentNavigation = useAiAgentNavigation as jest.Mock
const mockUseStoreConfiguration = useStoreConfiguration as jest.Mock
const mockGetCurrentAccountState = getCurrentAccountState as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

const wrapper = ({children}: {children: ReactNode}) => (
    <StaticRouter location="/app/ai-agent/shopify/teststore1/optimize">
        {children}
    </StaticRouter>
)

describe('AiAgentNavbarSectionBlock', () => {
    const defaultProps = {
        shopType: IntegrationType.Shopify as ShopType,
        shopName: 'Test Shop',
        onToggle: jest.fn(),
        name: 'Test Name',
        isExpanded: true,
    }

    beforeEach(() => {
        mockUseAiAgentNavigation.mockReturnValue({
            headerNavbarItems: [
                {route: '/route1', title: 'Route 1', dataCanduId: 'candu-1'},
                {route: '/route2', title: 'Route 2'},
            ],
            routes: {main: '/main'},
        })
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: {deactivatedDatetime: null},
            isLoading: false,
        })
        mockGetCurrentAccountState.mockReturnValue({
            get: jest.fn().mockReturnValue('test.com'),
        })
        mockUseAppSelector.mockReturnValue({
            get: jest.fn().mockReturnValue('test.com'),
        })
    })

    test('renders the component with enabled AI Agent', () => {
        render(<AiAgentNavbarSectionBlock {...defaultProps} />, {wrapper})

        expect(screen.getByAltText('shopify logo')).toBeInTheDocument()
        expect(screen.getByText('Route 1')).toBeInTheDocument()
        expect(screen.getByText('Route 2')).toBeInTheDocument()
        expect(screen.queryByText('Set Up')).not.toBeInTheDocument()
    })

    test('renders the component with disabled AI Agent', () => {
        mockUseStoreConfiguration.mockReturnValueOnce({
            storeConfiguration: {deactivatedDatetime: '2021-01-01'},
            isLoading: false,
        })

        render(<AiAgentNavbarSectionBlock {...defaultProps} />, {wrapper})

        expect(screen.getByAltText('shopify logo')).toBeInTheDocument()
        expect(screen.getByText('Set Up')).toBeInTheDocument()
        expect(screen.queryByText('Route 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Route 2')).not.toBeInTheDocument()
    })

    test('does not render the component when loading', () => {
        mockUseStoreConfiguration.mockReturnValueOnce({
            storeConfiguration: null,
            isLoading: true,
        })

        const {container} = render(
            <AiAgentNavbarSectionBlock {...defaultProps} />,
            {wrapper}
        )

        expect(container.firstChild).toBeNull()
    })
})
