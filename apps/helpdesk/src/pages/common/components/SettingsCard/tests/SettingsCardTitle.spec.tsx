import { render, screen } from '@testing-library/react'

import SettingsCardTitle from '../SettingsCardTitle'

describe('SettingsCard Components', () => {
    describe('SettingsCardTitle', () => {
        it('should render with default styles', () => {
            render(<SettingsCardTitle>Test Title</SettingsCardTitle>)
            expect(screen.getByText('Test Title')).toHaveClass('cardTitle')
        })

        it('should apply custom className', () => {
            render(
                <SettingsCardTitle className="custom-class">
                    Test Title
                </SettingsCardTitle>,
            )
            expect(screen.getByText('Test Title')).toHaveClass('custom-class')
        })

        it('should forward ref', () => {
            const ref = jest.fn()
            render(<SettingsCardTitle ref={ref}>Test Title</SettingsCardTitle>)
            expect(ref).toHaveBeenCalled()
        })

        it('should render with required asterisk', () => {
            render(<SettingsCardTitle isRequired>Test Title</SettingsCardTitle>)
            expect(screen.getByText('Test Title')).toHaveTextContent('*')
        })
    })
})
