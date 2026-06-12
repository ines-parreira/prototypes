import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { noop } from '@gorgias/toolkit'
import { migrationProviders } from '../../fixtures/migration-providers'
import {
    emptyMigrationStats,
    failedMigrationStats,
    migrationStatsWithFailures,
    migrationStatsWithoutFailures,
    partiallySucceededMigrationStats,
    succeededMigrationStats,
} from '../../fixtures/migration-sessions'
import { MigrationStatus } from '../../types'
import { parseSessionStats } from '../../utils'
import { MigrationStateModal } from './MigrationStateModal'

const provider = migrationProviders[0]

const succeededMigrationParsedStats = parseSessionStats({
    stats: succeededMigrationStats,
})
const partiallySucceededMigrationParsedStats = parseSessionStats({
    stats: partiallySucceededMigrationStats,
})
const failedMigrationParsedStats = parseSessionStats({
    stats: failedMigrationStats,
})
const emptyParsedStats = parseSessionStats({
    stats: emptyMigrationStats,
})
const parsedStatsWithFailures = parseSessionStats({
    stats: migrationStatsWithFailures,
})
const parsedStatsWithoutFailures = parseSessionStats({
    stats: migrationStatsWithoutFailures,
})

describe('<MigrationStateModal />', () => {
    describe('renders correctly for each state', () => {
        test('Connected', () => {
            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.Connected,
                        onMigrationStart: noop,
                        isMigrationStartLoading: false,
                    }}
                    stats={emptyParsedStats}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(
                screen.getByText('Migrate data from HelpDocs to Gorgias'),
            ).toBeInTheDocument()
            expect(screen.getByText('Start migrating')).toBeInTheDocument()
        })
        test('Migration start loading', () => {
            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.Connected,
                        onMigrationStart: noop,
                        isMigrationStartLoading: true,
                    }}
                    stats={emptyParsedStats}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(
                screen.getByText('Migrate data from HelpDocs to Gorgias'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Start migrating/i }),
            ).toBeDisabled()
        })
        test('In progress without failures', () => {
            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.InProgress,
                        progress: 25,
                    }}
                    stats={parsedStatsWithoutFailures}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(
                screen.getByText('Migrating from HelpDocs to Gorgias'),
            ).toBeInTheDocument()
            expect(screen.getByRole('progressbar')).toHaveAttribute(
                'aria-valuenow',
                '25',
            )
            expect(
                screen.queryByText('See what failed to import'),
            ).not.toBeInTheDocument()
        })
        test('In progress with failures', () => {
            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.InProgress,
                        progress: 25,
                    }}
                    stats={parsedStatsWithFailures}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(
                screen.getByText('Migrating from HelpDocs to Gorgias'),
            ).toBeInTheDocument()
            expect(screen.getByRole('progressbar')).toHaveAttribute(
                'aria-valuenow',
                '25',
            )
            expect(
                screen.getByText('See what failed to import'),
            ).toBeInTheDocument()
        })
        test('Succeeded', () => {
            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.Succeeded,
                        onFinish: noop,
                    }}
                    stats={succeededMigrationParsedStats}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Migration end')).toBeInTheDocument()
            expect(screen.getByText('100% Complete')).toBeInTheDocument()
            expect(screen.getByRole('progressbar')).toHaveAttribute(
                'aria-valuenow',
                '100',
            )
            expect(screen.getByText('Finish')).toBeInTheDocument()
        })
        test('Partially succeeded', () => {
            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.PartiallySucceeded,
                        onRetry: noop,
                        isRetryLoading: false,
                        onRevert: noop,
                        isRevertLoading: false,
                        onFinish: noop,
                    }}
                    stats={partiallySucceededMigrationParsedStats}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Migration end')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'The migration did not fully succeed, you can:',
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('Retry')).toBeInTheDocument()
            expect(screen.getByText('Revert')).toBeInTheDocument()
        })
        test('Completely failed', () => {
            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.Failed,
                        onRetry: noop,
                        isRetryLoading: false,
                        onFinish: noop,
                    }}
                    stats={failedMigrationParsedStats}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Migration end')).toBeInTheDocument()
            expect(
                screen.getByText('The migration completely failed'),
            ).toBeInTheDocument()
            expect(screen.getByText('Retry')).toBeInTheDocument()
            expect(screen.getByText('Close')).toBeInTheDocument()
        })
    })
    describe('callbacks handling', () => {
        it('should be able to click on start migration when status connected', () => {
            const migrationStartHandler = jest.fn()
            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.Connected,
                        isMigrationStartLoading: false,
                        onMigrationStart: migrationStartHandler,
                    }}
                    stats={emptyParsedStats}
                />,
            )

            const startButton = screen.getByText('Start migrating')
            fireEvent.click(startButton)

            expect(migrationStartHandler).toBeCalled()
        })
        test('Handlers on succeeded migration', () => {
            const finishHandler = jest.fn()
            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.Succeeded,
                        onFinish: finishHandler,
                    }}
                    stats={succeededMigrationParsedStats}
                />,
            )

            const finishButton = screen.getByText('Finish')
            fireEvent.click(finishButton)

            expect(finishHandler).toBeCalled()
        })
        test('Handlers on partially succeeded migration', () => {
            const retryHandler = jest.fn()
            const revertHandler = jest.fn()
            const finishHandler = jest.fn()

            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.PartiallySucceeded,
                        onRetry: retryHandler,
                        isRetryLoading: false,
                        onRevert: revertHandler,
                        isRevertLoading: false,
                        onFinish: finishHandler,
                    }}
                    stats={succeededMigrationParsedStats}
                />,
            )

            const retryButton = screen.getByText('Retry')
            fireEvent.click(retryButton)

            expect(retryHandler).toBeCalled()

            const revertButton = screen.getByText('Revert')
            fireEvent.click(revertButton)

            expect(revertHandler).toBeCalled()

            const finishButton = screen.getByText('End migration')
            fireEvent.click(finishButton)

            expect(finishHandler).toBeCalled()
        })
        test('Handlers on failed migration', () => {
            const retryHandler = jest.fn()
            const finishHandler = jest.fn()

            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.Failed,
                        onRetry: retryHandler,
                        isRetryLoading: false,
                        onFinish: finishHandler,
                    }}
                    stats={succeededMigrationParsedStats}
                />,
            )

            const retryButton = screen.getByText('Retry')
            fireEvent.click(retryButton)

            expect(retryHandler).toBeCalled()

            const finishButton = screen.getByText('Close')
            fireEvent.click(finishButton)

            expect(finishHandler).toBeCalled()
        })
    })
})
