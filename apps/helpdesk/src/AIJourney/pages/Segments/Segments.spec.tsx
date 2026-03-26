import { render, screen } from '@testing-library/react'

import { Segments } from './Segments'

describe('<Segments />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('page layout', () => {
        it('should render the Segments heading', () => {
            render(<Segments />)

            expect(
                screen.getByRole('heading', { name: 'Segments' }),
            ).toBeInTheDocument()
        })

        it('should render the Create segment button', () => {
            render(<Segments />)

            expect(
                screen.getByRole('button', { name: /create segment/i }),
            ).toBeInTheDocument()
        })
    })

    describe('table rendering', () => {
        it('should render the table column headers', () => {
            render(<Segments />)

            expect(screen.getByText('Title')).toBeInTheDocument()
            expect(screen.getByText('Estimated size')).toBeInTheDocument()
            expect(screen.getByText('Last updated')).toBeInTheDocument()
        })

        it('should render segment names from mock data', () => {
            render(<Segments />)

            expect(
                screen.getByText('Support small business'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Super brand like really super'),
            ).toBeInTheDocument()
        })

        it('should render estimated sizes for segments', () => {
            render(<Segments />)

            expect(screen.getByText('±0')).toBeInTheDocument()
            expect(screen.getByText('±98,762')).toBeInTheDocument()
        })
    })
})
