import { fireEvent, render, screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import useTicketSummary from 'pages/tickets/detail/hooks/useTicketSummary'

import TicketSummarySection, {
    AISummaryIcon,
    SummaryBody,
    SummaryBodySkeleton,
    SummaryInfo,
    SummarySkeleton,
    TicketSummaryButton,
} from '../TicketSummary'

jest.mock('utils', () => ({
    formatDatetime: (date: string) => `Formatted(${date})`,
}))

jest.mock('pages/tickets/detail/hooks/useTicketSummary', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('hooks/useGetDateAndTimeFormat', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const useTicketSummaryMock = useTicketSummary as jest.Mock
const useGetDateAndTimeFormatMock = useGetDateAndTimeFormat as jest.Mock
jest.mock('common/segment')
const logEventMock = logEvent as jest.Mock

const baseSummary = {
    content: 'AI-generated summary text',
    updated_datetime: '2024-01-01T10:00:00Z',
    created_datetime: '2024-01-01T09:00:00Z',
    triggered_by: 1,
}

describe('TicketSummarySection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useGetDateAndTimeFormatMock.mockReturnValue(jest.fn(() => 'MM/DD/YYYY'))
    })

    it('renders summarize button if not requested', () => {
        useTicketSummaryMock.mockReturnValue({
            summary: baseSummary,
            isLoading: false,
            errorMessage: null,
            isRetriable: true,
            requestSummary: jest.fn(),
            hasRequested: false,
        })

        render(<TicketSummarySection summary={null} ticketId={123} />)

        expect(screen.getByText('Summarize')).toBeInTheDocument()
    })

    it('shows loading skeletons when loading', () => {
        useTicketSummaryMock.mockReturnValue({
            summary: null,
            isLoading: true,
            errorMessage: null,
            isRetriable: true,
            requestSummary: jest.fn(),
            hasRequested: true,
        })

        render(<TicketSummarySection summary={null} ticketId={123} />)

        expect(
            screen.getAllByTestId('summary-skeleton').length,
        ).toBeGreaterThan(0)
    })

    it('shows summary content and update time', () => {
        useTicketSummaryMock.mockReturnValue({
            summary: baseSummary,
            isLoading: false,
            errorMessage: null,
            isRetriable: true,
            requestSummary: jest.fn(),
            hasRequested: true,
        })

        render(<TicketSummarySection summary={null} ticketId={123} />)

        expect(
            screen.getByText('AI-generated summary text'),
        ).toBeInTheDocument()
        expect(screen.getByText(/Updated Formatted/)).toBeInTheDocument()
    })

    it('shows error message and retry button when no content and error', () => {
        useTicketSummaryMock.mockReturnValue({
            summary: { ...baseSummary, content: '' },
            isLoading: false,
            errorMessage: 'Something went wrong',
            isRetriable: true,
            requestSummary: jest.fn(),
            hasRequested: true,
        })

        render(<TicketSummarySection summary={null} ticketId={123} />)

        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
        expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('hides retry button when error is not retriable (403)', () => {
        useTicketSummaryMock.mockReturnValue({
            summary: { ...baseSummary, content: '' },
            isLoading: false,
            errorMessage: 'Forbidden',
            isRetriable: false,
            requestSummary: jest.fn(),
            hasRequested: true,
        })

        render(<TicketSummarySection summary={null} ticketId={123} />)

        expect(screen.getByText('Forbidden')).toBeInTheDocument()
        expect(screen.queryByText('Try Again')).not.toBeInTheDocument()
    })

    it('calls requestSummary when retry button clicked', () => {
        const requestSummary = jest.fn()

        useTicketSummaryMock.mockReturnValue({
            summary: { ...baseSummary, content: '' },
            isLoading: false,
            errorMessage: 'Something went wrong',
            isRetriable: true,
            requestSummary,
            hasRequested: true,
        })

        render(<TicketSummarySection summary={null} ticketId={123} />)

        fireEvent.click(screen.getByText('Try Again'))

        expect(requestSummary).toHaveBeenCalledTimes(1)
    })

    it('shows error message when has summary content', () => {
        const requestSummary = jest.fn()

        useTicketSummaryMock.mockReturnValue({
            summary: baseSummary,
            isLoading: false,
            errorMessage: 'Something went wrong',
            isRetriable: true,
            requestSummary,
            hasRequested: true,
        })

        render(<TicketSummarySection summary={baseSummary} ticketId={123} />)

        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should log an event when summary is manually triggered in non-popover mode', () => {
        useTicketSummaryMock.mockReturnValue({
            summary: baseSummary,
            isLoading: false,
            isRetriable: true,
            requestSummary: jest.fn(),
            hasRequested: false,
        })
        render(
            <TicketSummarySection
                summary={null}
                ticketId={123}
                isPopup={false}
            />,
        )

        const button = screen.getByText('Summarize')
        expect(button).toBeInTheDocument()

        fireEvent.click(button)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiTicketSummaryInitManuallyRequested,
            {
                ticketId: 123,
                page: 'customer-timeline',
            },
        )
    })
})

describe('TicketSummaryButton', () => {
    it('renders with icon and children and handles click', () => {
        const handleClick = jest.fn()
        render(
            <TicketSummaryButton onClick={handleClick}>
                Click Me
            </TicketSummaryButton>,
        )

        expect(screen.getByText('Click Me')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Click Me'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should set a candu target attribute', () => {
        render(<TicketSummaryButton onClick={() => {}} />)
        expect(screen.getByRole('button')).toHaveAttribute(
            'data-candu-trigger-summary',
            'true',
        )
    })
})

describe('AISummaryIcon', () => {
    it('renders SVG icon correctly', () => {
        const { container } = render(<AISummaryIcon />)
        expect(container.querySelector('svg')).toBeInTheDocument()
    })
})

describe('SummarySkeleton', () => {
    it('renders with given width', () => {
        render(<SummarySkeleton width={80} />)
        expect(screen.getByTestId('summary-skeleton')).toHaveStyle('width: 80%')
    })
})

describe('SummaryBodySkeleton', () => {
    it('renders rows with different widths', () => {
        render(<SummaryBodySkeleton rows={[60, 80, 90]} />)

        expect(screen.getAllByTestId('summary-skeleton')).toHaveLength(3)
    })
})

describe('SummaryBody', () => {
    it('renders children inside summary body', () => {
        render(<SummaryBody>Body content</SummaryBody>)
        expect(screen.getByText('Body content')).toBeInTheDocument()
    })
})

describe('SummaryInfo', () => {
    it('renders children inside summary info', () => {
        render(<SummaryInfo>Info content</SummaryInfo>)
        expect(screen.getByText('Info content')).toBeInTheDocument()
    })
})
