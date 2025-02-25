import React from 'react'

import { render } from '@testing-library/react'
import { useHistory } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { RedirectToAiAgentStore } from '../RedirectToAiAgentStore'

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('state/integrations/selectors')

const mockUseHistory = useHistory as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseAiAgentNavigation = useAiAgentNavigation as jest.Mock

describe('RedirectToAiAgentStore', () => {
    const mockHistoryReplace = jest.fn()

    beforeEach(() => {
        mockUseHistory.mockReturnValue({ replace: mockHistoryReplace })
        mockUseAppSelector.mockReturnValue([{ name: 'Test Store' }])
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                main: '/',
            },
        })
    })

    test('redirects to the configuration route if a store is found', () => {
        render(<RedirectToAiAgentStore />)

        expect(mockHistoryReplace).toHaveBeenCalledWith('/')
    })

    test('renders the loading spinner if no store is found', () => {
        mockUseAppSelector.mockReturnValueOnce([])

        const { getByText } = render(<RedirectToAiAgentStore />)

        expect(mockHistoryReplace).not.toHaveBeenCalled()
        const descriptionElement = getByText(
            'Connect Shopify, Magento or BigCommerce stores to start using Automate!',
        )
        expect(descriptionElement).toBeInTheDocument()
    })
})
