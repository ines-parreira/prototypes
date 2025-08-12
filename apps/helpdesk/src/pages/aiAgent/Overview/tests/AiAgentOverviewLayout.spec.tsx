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
        isActionDrivenAiAgentNavigationEnabled: false,
    }

    it('should render children in a basic div when action driven navigation is disabled', () => {
        const { getByTestId, queryByTestId } = render(
            <AiAgentOverviewLayout {...defaultProps} />,
        )

        expect(getByTestId('test-children')).toBeInTheDocument()
        expect(queryByTestId('ai-agent-layout')).not.toBeInTheDocument()

        const container = getByTestId('test-children').parentElement
        expect(container).toHaveAttribute('data-overflow', 'visible')
    })

    it('should render children in a basic div when action driven navigation is enabled but no shop name', () => {
        const { getByTestId, queryByTestId } = render(
            <AiAgentOverviewLayout
                {...defaultProps}
                isActionDrivenAiAgentNavigationEnabled={true}
            />,
        )

        expect(getByTestId('test-children')).toBeInTheDocument()
        expect(queryByTestId('ai-agent-layout')).not.toBeInTheDocument()

        const container = getByTestId('test-children').parentElement
        expect(container).toHaveAttribute('data-overflow', 'visible')
    })

    it('should render AiAgentLayout when action driven navigation is enabled and shop name is provided', () => {
        const { getByTestId } = render(
            <AiAgentOverviewLayout
                {...defaultProps}
                isActionDrivenAiAgentNavigationEnabled={true}
                shopName="test-shop"
            />,
        )

        const aiAgentLayout = getByTestId('ai-agent-layout')
        expect(aiAgentLayout).toBeInTheDocument()
        expect(aiAgentLayout).toHaveAttribute('data-shop-name', 'test-shop')
        expect(aiAgentLayout).toHaveAttribute('data-title', 'Overview')
        expect(getByTestId('test-children')).toBeInTheDocument()
    })

    it('should pass correct className to AiAgentLayout when using action driven layout', () => {
        const { getByTestId } = render(
            <AiAgentOverviewLayout
                {...defaultProps}
                isActionDrivenAiAgentNavigationEnabled={true}
                shopName="test-shop"
            />,
        )

        const aiAgentLayout = getByTestId('ai-agent-layout')
        expect(aiAgentLayout).toHaveClass('containerActionDriven')
    })

    it('should render different children correctly', () => {
        const { getByTestId } = render(
            <AiAgentOverviewLayout
                isActionDrivenAiAgentNavigationEnabled={false}
            >
                <div data-testid="custom-content">
                    <h1>Custom Title</h1>
                    <p>Custom paragraph</p>
                </div>
            </AiAgentOverviewLayout>,
        )

        expect(getByTestId('custom-content')).toBeInTheDocument()
    })

    it('should handle empty shop name as falsy', () => {
        const { queryByTestId } = render(
            <AiAgentOverviewLayout
                {...defaultProps}
                isActionDrivenAiAgentNavigationEnabled={true}
                shopName=""
            />,
        )

        expect(queryByTestId('ai-agent-layout')).not.toBeInTheDocument()
    })

    it('should handle undefined shop name', () => {
        const { queryByTestId } = render(
            <AiAgentOverviewLayout
                {...defaultProps}
                isActionDrivenAiAgentNavigationEnabled={true}
                shopName={undefined}
            />,
        )

        expect(queryByTestId('ai-agent-layout')).not.toBeInTheDocument()
    })
})
