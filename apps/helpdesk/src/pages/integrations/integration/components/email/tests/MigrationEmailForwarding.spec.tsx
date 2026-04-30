import React from 'react'

import { render } from '@repo/testing'
import { cleanup, fireEvent, screen } from '@testing-library/react'

import type { EmailMigrationInboundVerification } from 'models/integration/types'

import MigrationEmailForwarding from '../EmailMigration/MigrationEmailForwarding'

const migration = {
    integration: { meta: {} },
} as unknown as EmailMigrationInboundVerification

describe('MigrationEmailForwarding', () => {
    const onNextClick = jest.fn()

    const renderComponent = (migrations: any) =>
        render(
            <MigrationEmailForwarding
                migrations={migrations}
                onNextClick={onNextClick}
            />,
        )

    afterEach(cleanup)

    it('should call onNextClick when there are no integrations left to inbound verify', () => {
        renderComponent([])

        fireEvent.click(
            screen.getByRole('button', {
                name: /next/i,
            }),
        )
        expect(onNextClick).toHaveBeenCalled()
    })

    it('should not call onNextClick when there are no integrations left to inbound verify', () => {
        renderComponent([migration])

        fireEvent.click(
            screen.getByRole('button', {
                name: /next/i,
            }),
        )
        expect(onNextClick).not.toHaveBeenCalled()
    })
})
