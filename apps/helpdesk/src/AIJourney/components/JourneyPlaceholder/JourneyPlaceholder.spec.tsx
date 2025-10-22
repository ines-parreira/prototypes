import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { JourneyPlaceholder } from './JourneyPlaceholder'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

const useParamsMock = jest.mocked(useParams)

describe('<JourneyPlaceholder />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useParamsMock.mockReturnValue({ shopName: 'test-shop' })
    })
    it('renders the journey name in both status and coverInfo', () => {
        render(<JourneyPlaceholder name="Test Journey" />)
        expect(screen.getAllByText('Test Journey')[0]).toBeInTheDocument()
        expect(screen.getAllByText('Test Journey')[1]).toBeInTheDocument()
    })

    it('renders the lightning icon', () => {
        render(<JourneyPlaceholder name="Test Journey" />)
        expect(screen.getByAltText('lightning')).toBeInTheDocument()
    })

    it('renders the coming soon text and calendar icon', () => {
        render(<JourneyPlaceholder name="Test Journey" />)
        expect(screen.getByText('Coming soon')).toBeInTheDocument()
        expect(screen.getByText('calendar_today')).toBeInTheDocument()
    })

    it('renders all placeholder images', () => {
        render(<JourneyPlaceholder name="Test Journey" />)
        expect(screen.getByAltText('placeholder_1')).toBeInTheDocument()
        expect(screen.getByAltText('placeholder_2')).toBeInTheDocument()
        expect(screen.getByAltText('placeholder_3')).toBeInTheDocument()
    })

    it('renders the calendar clock icon in coverInfo', () => {
        render(<JourneyPlaceholder name="Test Journey" />)
        expect(screen.getByAltText('calendar_clock')).toBeInTheDocument()
    })

    it('renders the secondary text', () => {
        render(<JourneyPlaceholder name="Test Journey" />)
        expect(screen.getByText('will be available soon')).toBeInTheDocument()
    })
})
