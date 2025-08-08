import { render, screen } from '@testing-library/react'

import { IntegrationType } from 'models/integration/types'

import TableImportEmail, { ImportEmailData } from '../TableImportEmail'

const MOCK_IMPORT_DATA: ImportEmailData[] = [
    {
        id: '1',
        email: 'info@betseyjohnson.com',
        emailCount: 333,
        dateRange: 'Jan 1, 2025 – Jan 25, 2025',
        status: 'in_progress',
        progressPercentage: 50,
        provider: IntegrationType.Gmail,
    },
    {
        id: '2',
        email: 'infoUSA@betseyjohnson.com',
        emailCount: 11333,
        dateRange: 'Dec 7, 2024 – Feb 7, 2025',
        status: 'in_progress',
        progressPercentage: 75,
        provider: IntegrationType.Gmail,
    },
    {
        id: '3',
        email: 'info@dolcevita.com',
        emailCount: 567,
        dateRange: 'May 1, 2025 – May 31, 2025',
        status: 'failed',
        progressPercentage: 0,
        provider: IntegrationType.Gmail,
    },
    {
        id: '4',
        email: 'info@dolcevita.ca',
        emailCount: 102,
        dateRange: 'June 7, 2025 – June 30, 2025',
        status: 'completed',
        progressPercentage: 100,
        provider: IntegrationType.Outlook,
    },
    {
        id: '5',
        email: 'info@dolcevita.mx',
        emailCount: 30,
        dateRange: 'June 4, 2024 – June 7, 2025',
        status: 'completed',
        progressPercentage: 100,
        provider: IntegrationType.Gmail,
    },
    {
        id: '6',
        email: 'info@stevemadden.fr',
        emailCount: 11333,
        dateRange: 'Dec 8, 2024 – June 7, 2025',
        status: 'completed',
        progressPercentage: 100,
        provider: IntegrationType.Outlook,
    },
]

describe('TableImportEmail', () => {
    describe('Table Structure', () => {
        it('renders table with correct headers', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            expect(screen.getByText('Email')).toBeInTheDocument()
            expect(screen.getByText('Import data')).toBeInTheDocument()
            expect(screen.getByText('Status')).toBeInTheDocument()
        })

        it('renders table wrapper component', () => {
            const { container } = render(
                <TableImportEmail data={MOCK_IMPORT_DATA} />,
            )

            expect(container.querySelector('table')).toBeInTheDocument()
        })
    })

    describe('Import Items Rendering', () => {
        it('renders all 6 mock import items', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            const emailElements = screen.getAllByText(/@/)
            expect(emailElements).toHaveLength(6)
        })

        it('displays email addresses correctly', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            expect(
                screen.getByText('info@betseyjohnson.com'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('infoUSA@betseyjohnson.com'),
            ).toBeInTheDocument()
            expect(screen.getByText('info@dolcevita.com')).toBeInTheDocument()
            expect(screen.getByText('info@dolcevita.ca')).toBeInTheDocument()
            expect(screen.getByText('info@dolcevita.mx')).toBeInTheDocument()
            expect(screen.getByText('info@stevemadden.fr')).toBeInTheDocument()
        })

        it('displays email counts with proper formatting', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            const emailCounts = screen.getAllByText((content) => {
                const normalizedContent = content.replace(/\s+/g, ' ').trim()
                return /\d+(?:,\d+)?\s+emails/.test(normalizedContent)
            })

            expect(emailCounts.length).toBeGreaterThanOrEqual(6)

            expect(
                screen.getAllByText(
                    (content) =>
                        content.includes('333') && content.includes('emails'),
                ).length,
            ).toBeGreaterThan(0)

            expect(
                screen.getAllByText(
                    (content) =>
                        content.includes('11,333') &&
                        content.includes('emails'),
                ).length,
            ).toBeGreaterThan(0)
        })

        it('shows date ranges are properly displayed', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            expect(
                screen.getByText('Jan 1, 2025 – Jan 25, 2025'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Dec 7, 2024 – Feb 7, 2025'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('May 1, 2025 – May 31, 2025'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('June 7, 2025 – June 30, 2025'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('June 4, 2024 – June 7, 2025'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Dec 8, 2024 – June 7, 2025'),
            ).toBeInTheDocument()
        })

        it('displays provider icons correctly', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            const gmailIcons = screen.getAllByAltText('gmail logo')
            const outlookIcons = screen.getAllByAltText('outlook logo')

            expect(gmailIcons.length).toBe(4)
            expect(outlookIcons.length).toBe(2)
            expect(gmailIcons.length + outlookIcons.length).toBe(6)
        })
    })

    describe('Status Display', () => {
        it('shows different status badges correctly', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            const completedBadges = screen.getAllByText('COMPLETED')
            const failedBadge = screen.getByText('FAILED')
            const progressBadges = screen.getAllByText(/% COMPLETED/)

            expect(completedBadges).toHaveLength(3)
            expect(failedBadge).toBeInTheDocument()
            expect(progressBadges).toHaveLength(2)
        })

        it('displays progress percentages for in-progress items', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            expect(screen.getByText('50% COMPLETED')).toBeInTheDocument()
            expect(screen.getByText('75% COMPLETED')).toBeInTheDocument()
        })

        it('shows status icons correctly', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            const successIcons = screen.getAllByText('✓')
            expect(successIcons).toHaveLength(3)

            const errorIcons = screen.getAllByText('✗')
            expect(errorIcons).toHaveLength(1)

            const loadingSpinners = screen.getAllByRole('status')
            expect(loadingSpinners).toHaveLength(2)
        })
    })

    describe('Loading State', () => {
        it('shows loading spinners for in-progress items', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            const loadingTexts = screen.getAllByText('Loading...')
            expect(loadingTexts).toHaveLength(2)
        })
    })

    describe('Data Structure Validation', () => {
        it('displays complete data structure for each item', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            const emailElements = screen.getAllByText(/@/)
            expect(emailElements).toHaveLength(6)

            const statusElements = screen.getAllByText(
                /COMPLETED|FAILED|% COMPLETED/,
            )
            expect(statusElements).toHaveLength(6)

            const dateElements = screen.getAllByText(
                /\w+ \d+, \d+ – \w+ \d+, \d+/,
            )
            expect(dateElements).toHaveLength(6)
        })

        it('renders proper table structure with body cells', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            const emailAddresses = screen.getAllByText(/@/)
            expect(emailAddresses).toHaveLength(6)
        })
    })

    describe('Component Integration', () => {
        it('integrates provider icons with email addresses', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            const emailElements = screen.getAllByText(/@/)
            const iconElements = screen.getAllByRole('img')

            expect(emailElements).toHaveLength(6)
            expect(iconElements).toHaveLength(6)
        })

        it('integrates import statistics with proper styling', () => {
            render(<TableImportEmail data={MOCK_IMPORT_DATA} />)

            const statsContainers = screen
                .getAllByText(/\d+ emails/)
                .map((el) => el.parentElement)

            statsContainers.forEach((container) => {
                expect(container).toBeInTheDocument()
                const dateText = container?.querySelector('p')
                expect(dateText).toBeInTheDocument()
            })
        })
    })
})
