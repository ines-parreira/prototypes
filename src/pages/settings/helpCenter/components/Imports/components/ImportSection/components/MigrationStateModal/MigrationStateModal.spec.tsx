import {fireEvent, render, screen} from '@testing-library/react'
import {noop} from 'lodash'
import React from 'react'

import {migrationProviders} from '../../fixtures/migration-providers'
import {
    emptyMigrationStats,
    failedMigrationStats,
    migrationStatsWithFailures,
    migrationStatsWithoutFailures,
    partiallySucceededMigrationStats,
    succeededMigrationStats,
} from '../../fixtures/migration-sessions'
import {MigrationStatus} from '../../types'
import {parseSessionStats} from '../../utils'

import MigrationStateModal from './MigrationStateModal'

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
    describe('snapshots', () => {
        test('Connected', () => {
            const {baseElement} = render(
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
                />
            )
            expect(baseElement).toMatchSnapshot()
        })
        test('Migration start loading', () => {
            const {baseElement} = render(
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
                />
            )
            expect(baseElement).toMatchSnapshot()
        })
        test('In progress without failures', () => {
            const {baseElement} = render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.InProgress,
                        progress: 25,
                    }}
                    stats={parsedStatsWithoutFailures}
                />
            )
            expect(baseElement).toMatchSnapshot()
        })
        test('In progress with failures', () => {
            const {baseElement} = render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.InProgress,
                        progress: 25,
                    }}
                    stats={parsedStatsWithFailures}
                />
            )
            expect(baseElement).toMatchSnapshot()
        })
        test('Succeeded', () => {
            const {baseElement} = render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.Succeeded,
                        onFinish: noop,
                    }}
                    stats={succeededMigrationParsedStats}
                />
            )
            expect(baseElement).toMatchSnapshot()
        })
        test('Partially succeeded', () => {
            const {baseElement} = render(
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
                />
            )
            expect(baseElement).toMatchSnapshot()
        })
        test('Completely failed', () => {
            const {baseElement} = render(
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
                />
            )
            expect(baseElement).toMatchSnapshot()
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
                />
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
                />
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
                />
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
                />
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
