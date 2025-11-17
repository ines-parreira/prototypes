import type { Import } from '@gorgias/helpdesk-types'

import type { Notification } from 'common/notifications'

import type { ImportNotification } from '../../types'

export const createMockNotification = (
    importData?: Partial<Import>,
): Notification<ImportNotification> => ({
    id: 'test-notification-id',
    inserted_datetime: '2023-01-01T00:00:00Z',
    read_datetime: null,
    seen_datetime: null,
    type: 'import.success',
    payload: {
        import: {
            id: 123,
            import_window_start: '2023-06-01T00:00:00Z',
            import_window_end: '2023-07-01T00:00:00Z',
            provider_identifier: 'test@example.com',
            ...importData,
        } as ImportNotification['import'],
    },
})

export const createMockFailedNotification = (
    importData?: Partial<Import>,
): Notification<ImportNotification> => ({
    ...createMockNotification(importData),
    type: 'import.failed',
})
