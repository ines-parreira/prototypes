import { render, screen } from '@testing-library/react'

import { EngagementSettingsCardImpact } from '../card/EngagementSettingsCardImpact'

describe('EngagementSettingsCardImpact', () => {
    describe('when isLoading is true', () => {
        it('should render a Skeleton', () => {
            render(
                <EngagementSettingsCardImpact
                    icon="test-icon"
                    impact={null}
                    isLoading={true}
                />,
            )

            const skeleton = screen.getByTestId('card-impact-skeleton')

            expect(skeleton).toBeInTheDocument()
            expect(skeleton.firstChild).toHaveClass('cardImpactSkeleton')
        })
    })

    describe('when isLoading is false and impact is null', () => {
        it('should not render anything', () => {
            const { container } = render(
                <EngagementSettingsCardImpact
                    icon="test-icon"
                    impact={null}
                    isLoading={false}
                />,
            )

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('when isLoading is false and impact is not null', () => {
        it('should render a Badge with the icon and impact', () => {
            render(
                <EngagementSettingsCardImpact
                    icon="test-icon"
                    impact="Test Impact"
                    isLoading={false}
                />,
            )

            const badgeText = screen.getByText('Test Impact')
            const icon = screen.getByText('test-icon')

            expect(badgeText).toBeInTheDocument()
            expect(badgeText).toHaveClass('cardImpactText')
            expect(badgeText.closest('div')).toHaveClass('cardImpact')

            expect(icon).toBeInTheDocument()
            expect(icon).toHaveClass('cardImpactIcon')
        })
    })
})
