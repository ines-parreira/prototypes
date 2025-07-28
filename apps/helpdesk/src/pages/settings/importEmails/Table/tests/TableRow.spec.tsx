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
                email: 'gmail@example.com',
            })

            renderTableRow(importItem)

            expect(screen.getByAltText('gmail logo')).toBeInTheDocument()
            expect(screen.getByText('gmail@example.com')).toBeInTheDocument()
        })

        it('displays Outlook provider icon and email address', () => {
            const importItem = createMockImportItem({
                provider: IntegrationType.Outlook,
                email: 'outlook@example.com',
            })

            renderTableRow(importItem)

            expect(screen.getByAltText('outlook logo')).toBeInTheDocument()
            expect(screen.getByText('outlook@example.com')).toBeInTheDocument()
        })

        it('displays fallback icon for unsupported provider', () => {
            const importItem = createMockImportItem({
                provider: 'unsupported' as any,
                email: 'unsupported@example.com',
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
                emailCount: 5432,
                import_window_start: '2024-12-01T00:00:00Z',
                import_window_end: '2025-01-15T00:00:00Z',
            })

            renderTableRow(importItem)

            expect(screen.getByText('5,432 emails')).toBeInTheDocument()
            expect(
                screen.getByText('Dec 1, 2024 – Jan 15, 2025'),
            ).toBeInTheDocument()
        })

        it('formats large email counts with commas', () => {
            const importItem = createMockImportItem({
                emailCount: 1234567,
            })

            renderTableRow(importItem)

            expect(screen.getByText('1,234,567 emails')).toBeInTheDocument()
        })

        it('displays single email count correctly', () => {
            const importItem = createMockImportItem({
                emailCount: 1,
            })

            renderTableRow(importItem)

            expect(screen.getByText('1 emails')).toBeInTheDocument()
        })

        it('handles zero email count', () => {
            const importItem = createMockImportItem({
                emailCount: 0,
            })

            renderTableRow(importItem)

            expect(screen.getByText('0 emails')).toBeInTheDocument()
        })
    })

    describe('Status Column', () => {
        describe('Completed Status', () => {
            it('displays completed status badge with success icon', () => {
                const importItem = createMockImportItem({
                    status: 'completed',
                    progressPercentage: 100,
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
                    progressPercentage: 50,
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
                    progressPercentage: 0,
                })

                renderTableRow(importItem)

                expect(screen.getByText('error_outline')).toBeInTheDocument()
                expect(screen.getByText('FAILED')).toBeInTheDocument()
            })

            it('ignores progress percentage for failed status', () => {
                const importItem = createMockImportItem({
                    status: 'failed',
                    progressPercentage: 75,
                })

                renderTableRow(importItem)

                expect(screen.getByText('FAILED')).toBeInTheDocument()
                expect(screen.queryByText('75%')).not.toBeInTheDocument()
            })
        })

        describe('In Progress Status', () => {
            it('displays in progress status badge with percentage', () => {
                const importItem = createMockImportItem({
                    status: 'in_progress',
                    progressPercentage: 65,
                })

                renderTableRow(importItem)

                expect(screen.getByText('65% COMPLETED')).toBeInTheDocument()
            })

            it('displays in progress status badge with 0% progress', () => {
                const importItem = createMockImportItem({
                    status: 'in_progress',
                    progressPercentage: 0,
                })

                renderTableRow(importItem)

                expect(screen.getByText('0% COMPLETED')).toBeInTheDocument()
            })

            it('displays in progress status badge with 100% progress', () => {
                const importItem = createMockImportItem({
                    status: 'in_progress',
                    progressPercentage: 100,
                })

                renderTableRow(importItem)

                expect(screen.getByText('100% COMPLETED')).toBeInTheDocument()
            })
        })

        describe('Unknown Status', () => {
            it('displays unknown status badge for unrecognized status', () => {
                const importItem = createMockImportItem({
                    status: 'unknown_status' as any,
                    progressPercentage: 50,
                })

                renderTableRow(importItem)

                expect(screen.getByText('UNKNOWN')).toBeInTheDocument()
            })

            it('displays unknown status badge for empty string status', () => {
                const importItem = createMockImportItem({
                    status: '' as any,
                    progressPercentage: 25,
                })

                renderTableRow(importItem)

                expect(screen.getByText('UNKNOWN')).toBeInTheDocument()
            })
        })
    })

    describe('Complete Import Item Rendering', () => {
        it('renders all import item data correctly', () => {
            const importItem = createMockImportItem({
                id: 'test-id-123',
                email: 'complete@test.com',
                emailCount: 9876,
                import_window_start: '2025-02-01T00:00:00Z',
                import_window_end: '2025-02-28T23:59:59Z',
                status: 'in_progress',
                progressPercentage: 42,
                provider: IntegrationType.Outlook,
            })

            renderTableRow(importItem)

            // Email column
            expect(screen.getByAltText('outlook logo')).toBeInTheDocument()
            expect(screen.getByText('complete@test.com')).toBeInTheDocument()

            // Import data column
            expect(screen.getByText('9,876 emails')).toBeInTheDocument()

            // Date range can vary based on timezone - check for either possible format
            const dateRangeExists =
                screen.queryByText('Feb 1, 2025 – Mar 1, 2025') ||
                screen.queryByText('Feb 1, 2025 – Feb 28, 2025')
            expect(dateRangeExists).toBeInTheDocument()

            // Status column
            expect(screen.getByText('42% COMPLETED')).toBeInTheDocument()
        })
    })

    describe('Accessibility', () => {
        it('renders table row with proper semantic structure', () => {
            const importItem = createMockImportItem()
            const { container } = renderTableRow(importItem)

            const tableRow = container.querySelector('tr')
            expect(tableRow).toBeInTheDocument()
            expect(tableRow?.children).toHaveLength(3) // 3 columns
        })

        it('provides alt text for provider icons', () => {
            const gmailItem = createMockImportItem({
                provider: IntegrationType.Gmail,
            })
            renderTableRow(gmailItem)
            expect(screen.getByAltText('gmail logo')).toBeInTheDocument()

            const outlookItem = createMockImportItem({
                provider: IntegrationType.Outlook,
            })
            renderTableRow(outlookItem)
            expect(screen.getByAltText('outlook logo')).toBeInTheDocument()
        })
    })

    describe('Edge Cases', () => {
        it('handles very long email addresses', () => {
            const importItem = createMockImportItem({
                email: 'very.long.email.address.that.might.cause.display.issues@verylongdomainname.com',
            })

            renderTableRow(importItem)

            expect(
                screen.getByText(
                    'very.long.email.address.that.might.cause.display.issues@verylongdomainname.com',
                ),
            ).toBeInTheDocument()
        })

        it('handles maximum email count', () => {
            const importItem = createMockImportItem({
                emailCount: 999999999,
            })

            renderTableRow(importItem)

            expect(screen.getByText('999,999,999 emails')).toBeInTheDocument()
        })
    })
})
