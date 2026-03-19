import type React from 'react'

import { render, screen } from '@testing-library/react'

import { TranslateSection } from './TranslateSection'

jest.mock('@gorgias/axiom', () => ({
    Card: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    Elevation: { Mid: 'mid' },
    Heading: ({ children }: { children: React.ReactNode }) => (
        <h2>{children}</h2>
    ),
    HeadingSize: { Sm: 'sm' },
}))

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
