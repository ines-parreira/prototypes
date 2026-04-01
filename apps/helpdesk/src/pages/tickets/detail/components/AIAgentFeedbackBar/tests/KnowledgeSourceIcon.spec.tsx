import { useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'

import type { KnowledgeSourceType } from '../constants'
import KnowledgeSourceIcon from '../KnowledgeSourceIcon'

jest.mock('@repo/feature-flags', () => ({
    useFlag: jest.fn(),
    FeatureFlagKey: {
        KnowledgeIntentManagementSystem: 'knowledge-intent-management-system',
    },
}))

const mockUseFlag = useFlag as jest.Mock

describe('KnowledgeSourceIcon', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

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

    it('renders icon for skill type', () => {
        const { container } = render(<KnowledgeSourceIcon type="skill" />)

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

    it('renders skill label when passed withLabel', () => {
        render(<KnowledgeSourceIcon type="skill" withLabel />)

        expect(screen.getByText('Skill')).toBeInTheDocument()
    })

    describe('feature flag KnowledgeIntentManagementSystem', () => {
        it('renders article icon when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)
            const { container } = render(<KnowledgeSourceIcon type="article" />)

            expect(container.querySelector('svg')).toBeInTheDocument()
        })

        it('renders article icon when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)
            const { container } = render(<KnowledgeSourceIcon type="article" />)

            expect(container.querySelector('svg')).toBeInTheDocument()
        })

        it('renders article label when withLabel and feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)
            render(<KnowledgeSourceIcon type="article" withLabel />)

            expect(screen.getByText('Help Center article')).toBeInTheDocument()
        })

        it('renders article label when withLabel and feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)
            render(<KnowledgeSourceIcon type="article" withLabel />)

            expect(screen.getByText('Help Center article')).toBeInTheDocument()
        })
    })
})
