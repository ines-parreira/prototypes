import React from 'react'
import {noop} from 'lodash'

import {fireEvent, render, screen} from '@testing-library/react'

import {migrationProviders} from '../../fixtures/migration-providers'
import {MigrationStatus} from '../../types'

import MigrationStateModal from './MigrationStateModal'

const provider = migrationProviders[0]

describe('<MigrationStateModal />', () => {
    describe('snapshots', () => {
        test('connected', () => {
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
                />
            )
            expect(baseElement).toMatchSnapshot()
        })
        test('migration start loading', () => {
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
                />
            )
            expect(baseElement).toMatchSnapshot()
        })
        test('progress', () => {
            const {baseElement} = render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.InProgress,
                        progress: 25,
                    }}
                />
            )
            expect(baseElement).toMatchSnapshot()
        })
        test('completed', () => {
            const {baseElement} = render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.Completed,
                    }}
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
                />
            )

            const startButton = screen.getByText('Start migrating')
            fireEvent.click(startButton)

            expect(migrationStartHandler).toBeCalled()
        })
        it('should refresh the page after clicking finish', () => {
            const reloadSpy = jest.spyOn(window.location, 'reload')
            render(
                <MigrationStateModal
                    isOpen
                    onClose={noop}
                    provider={provider}
                    state={{
                        status: MigrationStatus.Completed,
                    }}
                />
            )

            const finishButton = screen.getByText('Finish')
            fireEvent.click(finishButton)

            expect(reloadSpy).toBeCalled()
        })
    })
})
