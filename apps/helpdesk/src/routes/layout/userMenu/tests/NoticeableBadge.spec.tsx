import { render } from '@testing-library/react'

import { NoticeableBadge } from '../NoticeableBadge'

jest.mock('../useNoticeableWidget', () => ({
    useNoticeableUnreadCount: jest.fn(),
}))

const { useNoticeableUnreadCount } = jest.requireMock('../useNoticeableWidget')
const useNoticeableUnreadCountMock = useNoticeableUnreadCount as jest.Mock

describe('NoticeableBadge', () => {
    it('renders nothing when the unread count is zero', () => {
        useNoticeableUnreadCountMock.mockReturnValue(0)

        const { container } = render(<NoticeableBadge />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders the badge element when the unread count is greater than zero', () => {
        useNoticeableUnreadCountMock.mockReturnValue(3)

        const { container } = render(<NoticeableBadge />)

        const badge = container.querySelector('#noticeable-widget-notification')
        expect(badge).toBeInTheDocument()
        expect(badge?.tagName).toBe('SPAN')
    })
})
