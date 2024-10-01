import {cleanup, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'

import {migrationOutboundVerificationUnverifiedSingleSender} from 'fixtures/emailMigration'
import {mockStore} from 'utils/testing'

import SingleSenderVerificationTable from '../EmailMigration/SingleSenderVerificationTable'

const integrations =
    migrationOutboundVerificationUnverifiedSingleSender.integrations

jest.mock(
    'pages/integrations/integration/components/email/EmailMigration/SingleSenderVerificationTableRow',
    () => () => <div>SingleSenderVerificationTableRowMock</div>
)

describe('SingleSenderVerificationTable', () => {
    const renderComponent = () =>
        render(
            <Provider store={mockStore({} as any)}>
                <SingleSenderVerificationTable
                    refreshMigrationData={jest.fn()}
                    integrations={Array(10).fill(integrations[0])}
                    hasSubmittedBulkVerification={false}
                />
            </Provider>
        )

    afterEach(cleanup)

    it('should render only first 5 items', () => {
        renderComponent()
        expect(
            screen.getAllByText('SingleSenderVerificationTableRowMock')
        ).toHaveLength(5)
    })
})
