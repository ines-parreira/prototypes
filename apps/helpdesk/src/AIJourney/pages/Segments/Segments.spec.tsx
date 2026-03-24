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
    })
})
