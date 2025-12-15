import type { Integration } from '@gorgias/helpdesk-types'

import { ImportStatus } from '../types'

export const mockZendeskIntegrations: Integration[] = [
    {
        id: 1,
        type: 'zendesk',
        name: 'Zendesk Support Account 1',
        created_datetime: '2025-01-01T00:00:00Z',
        updated_datetime: '2025-01-15T10:30:00Z',
        meta: {
            status: ImportStatus.Success,
            continuous_import_enabled: true,
            sync_tickets: { count: 5432 },
            sync_macros: { count: 123 },
            sync_users: {
                customers_count: 890,
                users_count: 45,
            },
        },
    } as Integration,
    {
        id: 2,
        type: 'zendesk',
        name: 'Zendesk Support Account 2',
        created_datetime: '2025-01-01T00:00:00Z',
        updated_datetime: '2025-01-20T14:45:00Z',
        meta: {
            status: ImportStatus.Success,
            continuous_import_enabled: false,
            sync_tickets: { count: 1200 },
            sync_macros: { count: 56 },
            sync_users: {
                customers_count: 340,
                users_count: 12,
            },
        },
    } as Integration,
    {
        id: 3,
        type: 'zendesk',
        name: 'Zendesk Support Account 3',
        created_datetime: '2025-01-01T00:00:00Z',
        updated_datetime: '2025-01-10T08:15:00Z',
        meta: {
            status: ImportStatus.Pending,
            continuous_import_enabled: false,
            sync_tickets: { count: 250 },
            sync_macros: { count: 10 },
            sync_users: {
                customers_count: 100,
                users_count: 5,
            },
            account_stats: {
                tickets_count: 1000,
            },
        },
    } as Integration,
    {
        id: 4,
        type: 'zendesk',
        name: 'Zendesk Support Account 4',
        created_datetime: '2025-01-01T00:00:00Z',
        updated_datetime: '2025-01-25T16:20:00Z',
        meta: {
            status: ImportStatus.Success,
            continuous_import_enabled: true,
            sync_tickets: { count: 0 },
            sync_macros: { count: 0 },
            sync_users: {
                customers_count: 0,
                users_count: 0,
            },
        },
    } as Integration,
]

export const createMockIntegration = (
    overrides: Partial<Integration> = {},
): Integration =>
    ({
        ...mockZendeskIntegrations[0],
        ...overrides,
        meta: {
            ...mockZendeskIntegrations[0].meta,
            ...(overrides.meta || {}),
        },
    }) as Integration
