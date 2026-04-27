import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import { CancelOrderConfiguration } from '../CancelOrderConfiguration'

jest.mock('hooks/aiAgent/useAiAgentAccess')

const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>

const defaultProps = {
    shopName: 'my-store',
    isLoading: false,
    eligibility: undefined,
    responseMessageContent: { html: '', text: '' },
    onEligibilityChange: jest.fn(),
    onResponseMessageChange: jest.fn(),
}

describe('<CancelOrderConfiguration />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })

    it('should render loading skeletons when isLoading is true', () => {
        const { container } = render(
            <CancelOrderConfiguration {...defaultProps} isLoading={true} />,
        )

        expect(
            screen.queryByText(/Allow customers to request/i),
        ).not.toBeInTheDocument()
        expect(
            container.querySelectorAll('[class*="skeleton"]').length,
        ).toBeGreaterThan(0)
    })

    it('should render heading and eligibility section when loaded', () => {
        render(<CancelOrderConfiguration {...defaultProps} />)

        expect(
            screen.getByText(/Allow customers to request a cancellation/i),
        ).toBeInTheDocument()
        expect(screen.getByText('Eligibility window')).toBeInTheDocument()
    })

    it('should render response message when user has access', () => {
        render(<CancelOrderConfiguration {...defaultProps} />)

        expect(
            screen.getByLabelText('Response for unfulfilled orders'),
        ).toBeInTheDocument()
    })

    it('should not render response message when user lacks access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        render(<CancelOrderConfiguration {...defaultProps} />)

        expect(
            screen.queryByLabelText('Response for unfulfilled orders'),
        ).not.toBeInTheDocument()
    })
})
