import { extractGorgiasVideoDivFromHtmlContent, parseMedia } from 'utils'
import { linkifyHtml, linkifyString, sanitizeHtmlDefault } from 'utils/html'
import { assumeMock } from 'utils/testing'

import { processContent } from '../processContent'

// Mock the utility functions
jest.mock('utils', () => ({
    extractGorgiasVideoDivFromHtmlContent: jest.fn(),
    parseMedia: jest.fn(),
}))

jest.mock('utils/html', () => ({
    linkifyHtml: jest.fn(),
    linkifyString: jest.fn(),
    sanitizeHtmlDefault: jest.fn(),
}))

const parseMediaMock = assumeMock(parseMedia)
const linkifyHtmlMock = assumeMock(linkifyHtml)
const linkifyStringMock = assumeMock(linkifyString)
const sanitizeHtmlDefaultMock = assumeMock(sanitizeHtmlDefault)
const extractGorgiasVideoDivFromHtmlContentMock = assumeMock(
    extractGorgiasVideoDivFromHtmlContent,
)

describe('processContent', () => {
    const mockContent = '<div>Test content</div>'
    const mockParsedMedia = 'parsed media content'
    const mockLinkified = 'linkified content'
    const mockSanitized = 'sanitized content'
    const mockHtmlCleaned = 'cleaned html'
    const mockVideoUrls = ['video1.mp4', 'video2.mp4']

    beforeEach(() => {
        jest.clearAllMocks()
        parseMediaMock.mockReturnValue(mockParsedMedia)
        linkifyHtmlMock.mockReturnValue(mockLinkified)
        linkifyStringMock.mockReturnValue(mockLinkified)
        sanitizeHtmlDefaultMock.mockReturnValue(mockSanitized)
        extractGorgiasVideoDivFromHtmlContentMock.mockReturnValue({
            htmlCleaned: mockHtmlCleaned,
            videoUrls: mockVideoUrls,
        })
    })

    it('should process HTML content with videos', () => {
        const result = processContent(mockContent, true)

        expect(parseMediaMock).toHaveBeenCalledWith(mockContent, '1000x')
        expect(linkifyHtmlMock).toHaveBeenCalledWith(mockParsedMedia)
        expect(sanitizeHtmlDefaultMock).toHaveBeenCalledWith(mockLinkified)
        expect(extractGorgiasVideoDivFromHtmlContentMock).toHaveBeenCalledWith(
            mockSanitized,
        )
        expect(result).toEqual({
            processedContent: mockHtmlCleaned,
            videoUrls: mockVideoUrls,
        })
    })

    it('should process plain text content', () => {
        const result = processContent(mockContent, false)

        expect(parseMediaMock).toHaveBeenCalledWith(mockContent, '1000x')
        expect(linkifyStringMock).toHaveBeenCalledWith(mockParsedMedia)
        expect(sanitizeHtmlDefaultMock).toHaveBeenCalledWith(mockLinkified)
        expect(extractGorgiasVideoDivFromHtmlContentMock).not.toHaveBeenCalled()
        expect(result).toEqual({
            processedContent: mockSanitized,
            videoUrls: [],
        })
    })

    it('should handle null sanitized content', () => {
        sanitizeHtmlDefaultMock.mockReturnValue('null')
        const result = processContent(mockContent, false)

        expect(result).toEqual({
            processedContent: '',
            videoUrls: [],
        })
    })

    it('should handle empty content', () => {
        const emptyContent = ''
        parseMediaMock.mockReturnValue('')
        linkifyStringMock.mockReturnValue('')
        sanitizeHtmlDefaultMock.mockReturnValue('')

        const result = processContent(emptyContent, false)

        expect(result).toEqual({
            processedContent: '',
            videoUrls: [],
        })
    })
})
