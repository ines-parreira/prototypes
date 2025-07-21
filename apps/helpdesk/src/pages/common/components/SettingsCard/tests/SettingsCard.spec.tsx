import { render, screen } from '@testing-library/react'

import SettingsCard from '../SettingsCard'
import SettingsCardContent from '../SettingsCardContent'
import SettingsCardHeader from '../SettingsCardHeader'
import SettingsCardTitle from '../SettingsCardTitle'

describe('SettingsCard Components', () => {
    describe('SettingsCard', () => {
        it('should render with default styles', () => {
            render(<SettingsCard>Test Content</SettingsCard>)
            expect(screen.getByText('Test Content')).toHaveClass(
                'cardContainer',
            )
        })

        it('should apply custom className', () => {
            render(
                <SettingsCard className="custom-class">
                    Test Content
                </SettingsCard>,
            )
            expect(screen.getByText('Test Content')).toHaveClass('custom-class')
        })

        it('should forward ref', () => {
            const ref = jest.fn()
            render(<SettingsCard ref={ref}>Test Content</SettingsCard>)
            expect(ref).toHaveBeenCalled()
        })
    })

    describe('Integration', () => {
        it('should render a complete card with all components', () => {
            render(
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle>Card Title</SettingsCardTitle>
                        <div>
                            Header content with <a href="#">link</a>
                        </div>
                    </SettingsCardHeader>
                    <SettingsCardContent>Card content</SettingsCardContent>
                </SettingsCard>,
            )

            expect(screen.getByText('Card Title')).toBeInTheDocument()
            expect(screen.getByText('Header content with')).toBeInTheDocument()
            expect(screen.getByText('Card content')).toBeInTheDocument()
            expect(screen.getByRole('link')).toBeInTheDocument()
        })

        it('should maintain proper styling hierarchy', () => {
            render(
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle>Card Title</SettingsCardTitle>
                    </SettingsCardHeader>
                    <SettingsCardContent>Card content</SettingsCardContent>
                </SettingsCard>,
            )

            const card = screen
                .getByText('Card Title')
                .closest('.cardContainer') as HTMLElement
            const header = screen
                .getByText('Card Title')
                .closest('.cardHeader') as HTMLElement
            const title = screen
                .getByText('Card Title')
                .closest('.cardTitle') as HTMLElement
            const content = screen
                .getByText('Card content')
                .closest('.cardContent') as HTMLElement

            expect(card).toContainElement(header)
            expect(header).toContainElement(title)
            expect(card).toContainElement(content)
        })
    })
})
