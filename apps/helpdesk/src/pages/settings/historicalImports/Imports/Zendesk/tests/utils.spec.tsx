import { render, screen } from '@testing-library/react'

import { mockIntegration } from '@gorgias/helpdesk-mocks'
import type { Integration } from '@gorgias/helpdesk-types'

import { ImportStatus } from '../types'
import { mapStatus, mapSyncBtn } from '../utils'
import { mockZendeskIntegrations } from './fixture'

describe('mapStatus', () => {
    describe('Success Status', () => {
        it('returns "Completed" status when import is successful', () => {
            const integration = mockIntegration({
                ...mockZendeskIntegrations[0],
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: false,
                },
                updated_datetime: '2024-01-15T10:30:00Z',
            } as Integration)

            const result = mapStatus(integration)

            expect(result.status).toBe('Completed')
        })

        it('sets isSynchronizing to true when continuous import is enabled', () => {
            const integration = mockIntegration({
                ...mockZendeskIntegrations[0],
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: true,
                },
                updated_datetime: '2024-01-15T10:30:00Z',
            } as Integration)

            const result = mapStatus(integration)

            expect(result.isSynchronizing).toBe(true)
        })

        it('sets isSynchronizing to false when continuous import is disabled', () => {
            const integration = mockIntegration({
                ...mockZendeskIntegrations[0],
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: false,
                },
                updated_datetime: '2024-01-15T10:30:00Z',
            } as Integration)

            const result = mapStatus(integration)

            expect(result.isSynchronizing).toBe(false)
        })

        it('formats updated_datetime correctly', () => {
            const integration = mockIntegration({
                ...mockZendeskIntegrations[0],
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: false,
                },
                updated_datetime: '2024-01-15T10:30:00Z',
            } as Integration)

            const result = mapStatus(integration)

            expect(result.updatedDatetime).toBeDefined()
            expect(typeof result.updatedDatetime).toBe('string')
        })

        it('handles empty updated_datetime', () => {
            const integration = mockIntegration({
                ...mockZendeskIntegrations[0],
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: false,
                },
                updated_datetime: '',
            } as Integration)

            const result = mapStatus(integration)

            expect(result.updatedDatetime).toBeDefined()
        })
    })

    describe('Pending Status', () => {
        it('returns "in-progress" status when import is pending', () => {
            const integration = mockIntegration({
                ...mockZendeskIntegrations[2],
                meta: {
                    status: ImportStatus.Pending,
                    continuous_import_enabled: false,
                },
                updated_datetime: '2024-01-15T10:30:00Z',
            } as Integration)

            const result = mapStatus(integration)

            expect(result.status).toBe('in-progress')
            expect(result.isSynchronizing).toBe(false)
        })

        it('formats updated_datetime for pending status', () => {
            const integration = mockIntegration({
                ...mockZendeskIntegrations[2],
                meta: {
                    status: ImportStatus.Pending,
                    continuous_import_enabled: false,
                },
                updated_datetime: '2024-01-15T10:30:00Z',
            } as Integration)

            const result = mapStatus(integration)

            expect(result.updatedDatetime).toBeDefined()
            expect(typeof result.updatedDatetime).toBe('string')
        })
    })

    describe('RateLimitExceededBackoff Status', () => {
        it('returns "in-progress" status when rate limit is exceeded', () => {
            const integration = mockIntegration({
                ...mockZendeskIntegrations[0],
                meta: {
                    status: ImportStatus.RateLimitExceededBackoff,
                    continuous_import_enabled: false,
                },
                updated_datetime: '2024-01-15T10:30:00Z',
            } as Integration)

            const result = mapStatus(integration)

            expect(result.status).toBe('in-progress')
            expect(result.isSynchronizing).toBe(false)
        })
    })

    describe('Unknown Status', () => {
        it('returns "Unknown" status for unrecognized import status', () => {
            const integration = mockIntegration({
                ...mockZendeskIntegrations[0],
                meta: {
                    status: 'invalid-status' as any,
                    continuous_import_enabled: false,
                },
                updated_datetime: '2024-01-15T10:30:00Z',
            } as Integration)

            const result = mapStatus(integration)

            expect(result.status).toBe('Unknown')
            expect(result.isSynchronizing).toBe(false)
        })
    })
})

describe('mapSyncBtn', () => {
    it('renders "Synchronizing" badge when isSynchronizing is true', () => {
        const badge = mapSyncBtn(true)

        render(<div>{badge}</div>)

        expect(screen.getByText('Synchronizing')).toBeInTheDocument()
    })

    it('renders "Paused" badge when isSynchronizing is false', () => {
        const badge = mapSyncBtn(false)

        render(<div>{badge}</div>)

        expect(screen.getByText('Paused')).toBeInTheDocument()
    })

    it('renders pause icon when paused', () => {
        const badge = mapSyncBtn(false)

        render(<div>{badge}</div>)

        expect(screen.getByLabelText('media-pause-circle')).toBeInTheDocument()
    })
})
