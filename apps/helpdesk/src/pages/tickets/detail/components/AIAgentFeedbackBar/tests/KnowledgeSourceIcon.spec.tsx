import { render, screen } from '@testing-library/react'

import type { KnowledgeSourceType } from '../constants'
import KnowledgeSourceIcon from '../KnowledgeSourceIcon'

describe('KnowledgeSourceIcon', () => {
    it('renders Shopify icon if type is "order"', () => {
        const { container } = render(<KnowledgeSourceIcon type="order" />)

        const icon = container.querySelector('svg')
        expect(icon).toBeInTheDocument()
    })

    it('renders icon based on type', () => {
        const { container } = render(<KnowledgeSourceIcon type="action" />)

        const icon = container.querySelector('svg')
        expect(icon).toBeInTheDocument()
    })

    it('renders nothing for unknown type', () => {
        render(
            <KnowledgeSourceIcon
                type={'unknown_type' as KnowledgeSourceType}
            />,
        )

        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('renders label when passed withLabel', () => {
        render(<KnowledgeSourceIcon type="order" withLabel />)

        expect(screen.getByText('Order')).toBeInTheDocument()
    })
})
