import { useNoticeableUnreadCount } from './useNoticeableWidget'

export function NoticeableBadge() {
    const count = useNoticeableUnreadCount()

    if (count === 0) return null

    return (
        <span
            id="noticeable-widget-notification"
            style={{ visibility: 'visible' }}
        />
    )
}
