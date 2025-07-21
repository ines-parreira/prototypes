import { render, screen } from '@testing-library/react'

import { KNOWLEDGE_SOURCE_TYPE } from '../constants'
import KnowledgeSourceIcon from '../KnowledgeSourceIcon'

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less',
    () => ({
        shopifyLogo: 'shopify-logo',
        badge: 'badge-class',
    }),
)

jest.mock('assets/img/icons/shopifyStore.svg', () => 'shopifyStore.svg')

describe('KnowledgeSourceIcon', () => {
    it('renders Shopify logo if type is "order"', () => {
        render(<KnowledgeSourceIcon type="order" />)

        const image = screen.getByAltText('shopify logo')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', 'shopifyStore.svg')
    })

    it('renders default icon based on type', () => {
        render(<KnowledgeSourceIcon type={'action'} />)

        const iconName = KNOWLEDGE_SOURCE_TYPE['action'].icon
        const icon = screen.getByText(iconName)

        expect(icon).toBeInTheDocument()
        expect(icon).toHaveClass('material-icons')
    })

    it('renders nothing for unknown type', () => {
        render(<KnowledgeSourceIcon type={'unknown_type' as any} />)

        // Expect nothing rendered
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
        expect(screen.queryByText(/./)).toBeNull()
    })

    it('renders label when passed withLabel', () => {
        render(<KnowledgeSourceIcon type="order" withLabel />)

        expect(screen.getByText('Order')).toBeInTheDocument()
    })
})
