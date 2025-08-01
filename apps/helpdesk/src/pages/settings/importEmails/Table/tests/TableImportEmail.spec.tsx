import { render, screen } from '@testing-library/react'

import TableImportEmail from '../TableImportEmail'

describe('TableImportEmail', () => {
    describe('Table Structure', () => {
        it('renders table with correct headers', () => {
            render(<TableImportEmail />)

            expect(screen.getByText('Email')).toBeInTheDocument()
            expect(screen.getByText('Import data')).toBeInTheDocument()
            expect(screen.getByText('Status')).toBeInTheDocument()
        })
    })

    describe('Import Items Rendering', () => {
        it('renders 8 import items due to pagination', () => {
            render(<TableImportEmail />)

            const emailElements = screen.getAllByText(/@/)
            expect(emailElements).toHaveLength(8)
        })

        it('displays email counts with proper formatting', () => {
            render(<TableImportEmail />)

            expect(screen.getByText('890 emails')).toBeInTheDocument()
            expect(screen.getByText('333 emails')).toBeInTheDocument()
        })

        it('shows date ranges are properly displayed', () => {
            render(<TableImportEmail />)

            // Since all mock items have the same date range, we should find multiple instances
            const dateElements = screen.getAllByText(
                'Jun 1, 2025 – Jul 1, 2025',
            )
            expect(dateElements.length).toBe(8) // Should match the number of rendered items
        })

        it('displays provider icons correctly', () => {
            render(<TableImportEmail />)

            const gmailIcons = screen.getAllByAltText('gmail logo')
            const outlookIcons = screen.getAllByAltText('outlook logo')

            expect(gmailIcons.length).toBeGreaterThan(0)
            expect(outlookIcons.length).toBeGreaterThan(0)
            expect(gmailIcons.length + outlookIcons.length).toBe(8)
        })
    })

    describe('Status Display', () => {
        it('shows different status badges', () => {
            render(<TableImportEmail />)

            const completedBadges = screen.getAllByText('COMPLETED')
            const failedBadges = screen.queryAllByText('FAILED')
            const progressBadges = screen.queryAllByText(/% COMPLETED/)

            expect(completedBadges.length).toBeGreaterThan(0)
            expect(
                completedBadges.length +
                    failedBadges.length +
                    progressBadges.length,
            ).toBe(8)
        })

        it('displays progress indicators when present', () => {
            render(<TableImportEmail />)

            expect(screen.getByText('50% COMPLETED')).toBeInTheDocument()
            expect(screen.getByText('75% COMPLETED')).toBeInTheDocument()
        })
    })

    it('shows material icons for status indicators', () => {
        render(<TableImportEmail />)

        const checkIcons = screen.getAllByText('check_circle_outline')
        const errorIcons = screen.queryAllByText('error_outline')

        expect(checkIcons.length).toBeGreaterThan(0)
        expect(checkIcons.length + errorIcons.length).toBeLessThanOrEqual(8)
    })
})
