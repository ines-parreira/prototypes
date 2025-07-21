import { render, screen } from '@testing-library/react'

import SettingsCardContent from '../SettingsCardContent'

describe('SettingsCard Components', () => {
    describe('SettingsCardContent', () => {
        it('should render with default styles', () => {
            render(<SettingsCardContent>Test Content</SettingsCardContent>)
            expect(screen.getByText('Test Content')).toHaveClass('cardContent')
        })

        it('should apply custom className', () => {
            render(
                <SettingsCardContent className="custom-class">
                    Test Content
                </SettingsCardContent>,
            )
            expect(screen.getByText('Test Content')).toHaveClass('custom-class')
        })

        it('should forward ref', () => {
            const ref = jest.fn()
            render(
                <SettingsCardContent ref={ref}>
                    Test Content
                </SettingsCardContent>,
            )
            expect(ref).toHaveBeenCalled()
        })
    })
})
