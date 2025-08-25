import { render } from '@testing-library/react'

import { AiAgentOverviewLayout } from '../layout/AiAgentOverviewLayout'

jest.mock('pages/aiAgent/components/AiAgentLayout/AiAgentLayout', () => ({
    AiAgentLayout: ({
        children,
        shopName,
        className,
        title,
    }: {
        children: React.ReactNode
        shopName: string
        className: string
        title: string
    }) => (
        <div
            data-testid="ai-agent-layout"
            data-shop-name={shopName}
            data-title={title}
            className={className}
        >
            {children}
        </div>
    ),
}))

describe('AiAgentOverviewLayout', () => {
    const defaultProps = {
        children: <div data-testid="test-children">Test Content</div>,
    }

    it('should render AiAgentLayout', () => {
        const { getByTestId } = render(
            <AiAgentOverviewLayout {...defaultProps} shopName="test-shop" />,
        )

        const aiAgentLayout = getByTestId('ai-agent-layout')
        expect(aiAgentLayout).toBeInTheDocument()
        expect(aiAgentLayout).toHaveAttribute('data-shop-name', 'test-shop')
        expect(aiAgentLayout).toHaveAttribute('data-title', 'Overview')
        expect(getByTestId('test-children')).toBeInTheDocument()
    })

    it('should pass correct className to AiAgentLayout', () => {
        const { getByTestId } = render(
            <AiAgentOverviewLayout {...defaultProps} shopName="test-shop" />,
        )

        const aiAgentLayout = getByTestId('ai-agent-layout')
        expect(aiAgentLayout).toHaveClass('containerActionDriven')
    })
})
