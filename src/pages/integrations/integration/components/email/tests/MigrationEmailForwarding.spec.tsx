import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import {mockStore} from 'utils/testing'
import {EmailMigration} from 'models/integration/types'
import MigrationEmailForwarding from '../EmailMigration/MigrationEmailForwarding'

const migration = {integration: {meta: {}}} as unknown as EmailMigration

describe('MigrationEmailForwarding', () => {
    const onNextClick = jest.fn()

    const renderComponent = (migrations: any) =>
        render(
            <Provider store={mockStore({} as any)}>
                <MigrationEmailForwarding
                    migrations={migrations}
                    onNextClick={onNextClick}
                />
            </Provider>
        )

    afterEach(cleanup)

    it('should call onNextClick when there are no integrations left to inbound verify', () => {
        renderComponent([])

        fireEvent.click(
            screen.getByRole('button', {
                name: /next/i,
            })
        )
        expect(onNextClick).toHaveBeenCalled()
    })

    it('should not call onNextClick when there are no integrations left to inbound verify', () => {
        renderComponent([migration])

        fireEvent.click(
            screen.getByRole('button', {
                name: /next/i,
            })
        )
        expect(onNextClick).toHaveBeenCalled()
    })
})
