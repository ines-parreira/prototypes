import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { TranslateSection } from './TranslateSection'

describe('TranslateSection', () => {
    it('should render the section title', () => {
        render(<TranslateSection title="General">{null}</TranslateSection>)

        expect(
            screen.getByRole('heading', { name: 'General' }),
        ).toBeInTheDocument()
    })

    it('should render children', () => {
        render(
            <TranslateSection title="General">
                <div>Row 1</div>
                <div>Row 2</div>
            </TranslateSection>,
        )

        expect(screen.getByText('Row 1')).toBeInTheDocument()
        expect(screen.getByText('Row 2')).toBeInTheDocument()
    })
})
