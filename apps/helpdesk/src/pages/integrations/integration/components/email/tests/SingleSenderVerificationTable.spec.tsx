import React from 'react'

import { render } from '@repo/testing'
import { cleanup, screen } from '@testing-library/react'

import { migrationOutboundVerificationUnverifiedSingleSender } from 'fixtures/emailMigration'

import { SingleSenderVerificationTable } from '../EmailMigration/SingleSenderVerificationTable'

const integrations =
    migrationOutboundVerificationUnverifiedSingleSender.integrations

jest.mock(
    'pages/integrations/integration/components/email/EmailMigration/SingleSenderVerificationTableRow',
    () => ({
        SingleSenderVerificationTableRow: () => (
            <div>SingleSenderVerificationTableRowMock</div>
        ),
    }),
)

describe('SingleSenderVerificationTable', () => {
    const renderComponent = () =>
        render(
            <SingleSenderVerificationTable
                refreshMigrationData={jest.fn()}
                integrations={Array(10).fill(integrations[0])}
                hasSubmittedBulkVerification={false}
            />,
        )

    afterEach(cleanup)

    it('should render only first 5 items', () => {
        renderComponent()
        expect(
            screen.getAllByText('SingleSenderVerificationTableRowMock'),
        ).toHaveLength(5)
    })
})
