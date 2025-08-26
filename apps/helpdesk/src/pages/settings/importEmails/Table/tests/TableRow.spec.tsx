import { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'

import { mockImportItems } from '../../fixture'
import { ImportItem } from '../../types'
import { TableRow } from '../TableRow'

type TableRowProps = ComponentProps<typeof TableRow>

describe('TableRow', () => {
    const createMockImportItem = (
        overrides: Partial<ImportItem> = {},
    ): ImportItem => ({
        ...mockImportItems[0],
        ...overrides,
    })

    const renderTableRow = (importItem: ImportItem) => {
        return render(
            <table>
                <tbody>
                    <TableRow
                        importItem={
                            importItem as unknown as TableRowProps['importItem']
                        }
                    />
                </tbody>
            </table>,
        )
    }

    describe('Email Column', () => {
        it('displays Gmail provider icon and email address', () => {
            const importItem = createMockImportItem({
                provider: IntegrationType.Gmail,
                provider_identifier: 'gmail@example.com',
            })

            renderTableRow(importItem)

            expect(screen.getByAltText('gmail logo')).toBeInTheDocument()
            expect(screen.getByText('gmail@example.com')).toBeInTheDocument()
        })

        it('displays Outlook provider icon and email address', () => {
            const importItem = createMockImportItem({
                provider: IntegrationType.Outlook,
                provider_identifier: 'outlook@example.com',
            })

            renderTableRow(importItem)

            expect(screen.getByAltText('outlook logo')).toBeInTheDocument()
            expect(screen.getByText('outlook@example.com')).toBeInTheDocument()
        })

        it('displays fallback icon for unsupported provider', () => {
            const importItem = createMockImportItem({
                provider: 'unsupported' as any,
                provider_identifier: 'unsupported@example.com',
            })

            renderTableRow(importItem)

            expect(screen.getByText('email')).toBeInTheDocument()
            expect(
                screen.getByText('unsupported@example.com'),
            ).toBeInTheDocument()
        })
    })

    describe('Import Data Column', () => {
        it('displays email count and date range', () => {
            const importItem = createMockImportItem({
                stats: {
                    total_messages_imported: 5000,
                    total_tickets_created: 5432,
                },
                import_window_start: '2024-12-01T00:00:00Z',
                import_window_end: '2025-01-15T00:00:00Z',
            })

            renderTableRow(importItem)

            expect(screen.getByText('5,000 emails')).toBeInTheDocument()
            expect(
                screen.getByText('Dec 1, 2024 – Jan 15, 2025'),
            ).toBeInTheDocument()
        })

        it('formats large email counts with commas', () => {
            const importItem = createMockImportItem({
                stats: {
                    total_messages_imported: 5432,
                },
            })

            renderTableRow(importItem)

            expect(screen.getByText('5,432 emails')).toBeInTheDocument()
        })

        it('displays single email count correctly', () => {
            const importItem = createMockImportItem({
                stats: {
                    total_tickets_created: 1,
                    total_messages_imported: 1,
                },
            })

            renderTableRow(importItem)

            expect(screen.getByText('1 emails')).toBeInTheDocument()
        })

        it('handles zero email count', () => {
            const importItem = createMockImportItem({
                stats: {
                    total_messages_imported: 0,
                },
            })

            renderTableRow(importItem)

            expect(screen.getByText('0 emails')).toBeInTheDocument()
        })

        it('handles undefined total_messages_imported and falls back to 0', () => {
            const importItem = createMockImportItem({
                stats: {
                    total_messages_imported: undefined,
                },
            })

            renderTableRow(importItem)

            expect(screen.getByText('0 emails')).toBeInTheDocument()
        })

        it('formats very large numbers with proper locale formatting', () => {
            const importItem = createMockImportItem({
                stats: {
                    total_messages_imported: 1234567890,
                },
            })

            renderTableRow(importItem)

            expect(screen.getByText('1,234,567,890 emails')).toBeInTheDocument()
        })
    })

    describe('Status Column', () => {
        describe('Completed Status', () => {
            it('displays completed status badge with success icon', () => {
                const importItem = createMockImportItem({
                    status: 'completed',
                    progress_percentage: 100,
                })

                renderTableRow(importItem)

                expect(
                    screen.getByText('check_circle_outline'),
                ).toBeInTheDocument()
                expect(screen.getByText('COMPLETED')).toBeInTheDocument()
            })

            it('ignores progress percentage for completed status', () => {
                const importItem = createMockImportItem({
                    status: 'completed',
                    progress_percentage: 50,
                })

                renderTableRow(importItem)

                expect(screen.getByText('COMPLETED')).toBeInTheDocument()
                expect(screen.queryByText('50%')).not.toBeInTheDocument()
            })
        })

        describe('Failed Status', () => {
            it('displays failed status badge with error icon', () => {
                const importItem = createMockImportItem({
                    status: 'failed',
                    progress_percentage: 0,
                })

                renderTableRow(importItem)

                expect(screen.getByText('error_outline')).toBeInTheDocument()
                expect(screen.getByText('FAILED')).toBeInTheDocument()
            })

            it('ignores progress percentage for failed status', () => {
                const importItem = createMockImportItem({
                    status: 'failed',
                    progress_percentage: 75,
                })

                renderTableRow(importItem)

                expect(screen.getByText('FAILED')).toBeInTheDocument()
                expect(screen.queryByText('75%')).not.toBeInTheDocument()
            })
        })

        describe('In Progress Status', () => {
            it('displays in progress status badge with percentage', () => {
                const importItem = createMockImportItem({
                    status: 'in-progress',
                    progress_percentage: 65,
                })

                renderTableRow(importItem)

                expect(screen.getByText('65% COMPLETED')).toBeInTheDocument()
            })

            it('displays in progress status badge with 0% progress', () => {
                const importItem = createMockImportItem({
                    status: 'in-progress',
                    progress_percentage: 0,
                })

                renderTableRow(importItem)

                expect(screen.getByText('0% COMPLETED')).toBeInTheDocument()
            })

            it('displays in progress status badge with 100% progress', () => {
                const importItem = createMockImportItem({
                    status: 'in-progress',
                    progress_percentage: 100,
                })

                renderTableRow(importItem)

                expect(screen.getByText('100% COMPLETED')).toBeInTheDocument()
            })
        })

        describe('Unknown Status', () => {
            it('displays unknown status badge for unrecognized status', () => {
                const importItem = createMockImportItem({
                    status: 'unknown_status' as any,
                    progress_percentage: 50,
                })

                renderTableRow(importItem)

                expect(screen.getByText('UNKNOWN')).toBeInTheDocument()
            })

            it('displays unknown status badge for empty string status', () => {
                const importItem = createMockImportItem({
                    status: '' as any,
                    progress_percentage: 25,
                })

                renderTableRow(importItem)

                expect(screen.getByText('UNKNOWN')).toBeInTheDocument()
            })
        })
    })

    describe('Complete Import Item Rendering', () => {
        it('renders all import item data correctly', () => {
            const importItem = createMockImportItem({
                id: 123,
                provider_identifier: 'complete@test.com',
                stats: {
                    total_messages_imported: 9876,
                },
                import_window_start: '2025-02-01T00:00:00Z',
                import_window_end: '2025-02-28T23:59:59Z',
                status: 'in-progress',
                progress_percentage: 42,
                provider: IntegrationType.Outlook,
            })

            renderTableRow(importItem)

            expect(screen.getByAltText('outlook logo')).toBeInTheDocument()
            expect(screen.getByText('complete@test.com')).toBeInTheDocument()

            expect(screen.getByText('9,876 emails')).toBeInTheDocument()

            const dateRangeExists =
                screen.queryByText('Feb 1, 2025 – Mar 1, 2025') ||
                screen.queryByText('Feb 1, 2025 – Feb 28, 2025')
            expect(dateRangeExists).toBeInTheDocument()

            expect(screen.getByText('42% COMPLETED')).toBeInTheDocument()
        })
    })
})
