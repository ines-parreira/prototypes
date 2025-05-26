import { render, screen } from '@testing-library/react'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import { parseHtml } from 'utils/html'
import { assumeMock } from 'utils/testing'

import { processContent } from '../../helpers/processContent'
import { MessageContent } from '../MessageContent'

// Mock external dependencies
jest.mock('react-player', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="mock-react-player" />),
}))

jest.mock('utils/html', () => ({
    parseHtml: jest.fn(),
}))

jest.mock('../../helpers/processContent', () => ({
    processContent: jest.fn(),
}))

const mockedParseHtml = assumeMock(parseHtml)
const mockedProcessContent = assumeMock(processContent)

describe('MessageContent', () => {
    const mockMessage = {
        body_html: '<p>Test HTML content</p>',
        body_text: 'Test text content',
        stripped_html: null,
        stripped_text: null,
        meta: {},
    } as TicketMessage

    const createMockDocument = (
        elements: Array<{ style: { color: string } }>,
    ) =>
        ({
            querySelectorAll: jest.fn().mockReturnValue(elements),
        }) as unknown as Document

    beforeEach(() => {
        mockedParseHtml.mockReturnValue(createMockDocument([]))
        mockedProcessContent.mockReturnValue({
            processedContent: '<p>Processed content</p>',
            videoUrls: [],
        })
    })

    it('renders HTML content when available', () => {
        render(<MessageContent message={mockMessage} isFailed={false} />)

        expect(screen.getByText('Processed content')).toBeInTheDocument()
    })

    it('renders text content when HTML is not available', () => {
        const textOnlyMessage = {
            ...mockMessage,
            body_html: null,
            body_text: 'Plain text content',
        }
        mockedProcessContent.mockReturnValue({
            processedContent: 'Plain text content',
            videoUrls: [],
        })

        render(<MessageContent message={textOnlyMessage} isFailed={false} />)

        expect(screen.getByText('Plain text content')).toBeInTheDocument()
    })

    it('applies failed class when isFailed is true', () => {
        render(<MessageContent message={mockMessage} isFailed={true} />)
        const content = screen.getByText('Processed content')
        expect(content.parentElement).toHaveClass('failed')
    })

    it('shows truncated message disclaimer when content is truncated', () => {
        const truncatedMessage = {
            ...mockMessage,
            meta: {
                body_html_truncated: true,
            },
        }

        render(<MessageContent message={truncatedMessage} isFailed={false} />)

        expect(
            screen.getByText(/This message is too large to display/),
        ).toBeInTheDocument()
    })

    it('renders video player when video URLs are present', () => {
        const videoUrls = ['https://example.com/video.mp4']
        mockedProcessContent.mockReturnValue({
            processedContent: '<p>Content with video</p>',
            videoUrls,
        })

        render(<MessageContent message={mockMessage} isFailed={false} />)

        expect(screen.getByTestId('mock-react-player')).toBeInTheDocument()
    })

    it('applies light theme when HTML contains color styles', () => {
        mockedParseHtml.mockReturnValue(
            createMockDocument([{ style: { color: 'red' } }]),
        )

        render(<MessageContent message={mockMessage} isFailed={false} />)

        const content = screen.getByText('Processed content')
        expect(content.parentElement).toHaveClass('light')
    })

    it('returns null when no content is available', () => {
        mockedProcessContent.mockReturnValue({
            processedContent: '',
            videoUrls: [],
        })

        const { container } = render(
            <MessageContent message={mockMessage} isFailed={false} />,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
