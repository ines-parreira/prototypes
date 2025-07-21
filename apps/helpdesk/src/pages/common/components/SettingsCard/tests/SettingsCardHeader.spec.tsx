import { render, screen } from '@testing-library/react'

import SettingsCardHeader from '../SettingsCardHeader'

describe('SettingsCard Components', () => {
    describe('SettingsCardHeader', () => {
        it('should render with default styles', () => {
            render(<SettingsCardHeader>Test Header</SettingsCardHeader>)
            const header = screen.getByText('Test Header')
            expect(header).toHaveClass('cardHeader')
        })

        it('should apply custom className', () => {
            render(
                <SettingsCardHeader className="custom-class">
                    Test Header
                </SettingsCardHeader>,
            )
            expect(screen.getByText('Test Header')).toHaveClass('custom-class')
        })

        it('should forward ref', () => {
            const ref = jest.fn()
            render(
                <SettingsCardHeader ref={ref}>Test Header</SettingsCardHeader>,
            )
            expect(ref).toHaveBeenCalled()
        })

        it('should render links within header', () => {
            render(
                <SettingsCardHeader>
                    Test with <a href="#">link</a>
                </SettingsCardHeader>,
            )

            expect(screen.getByRole('link')).toBeInTheDocument()
        })
    })
})
