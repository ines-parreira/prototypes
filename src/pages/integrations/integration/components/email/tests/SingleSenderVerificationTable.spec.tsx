import {cleanup, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import {mockStore} from 'utils/testing'
import {migrationOutboundVerificationUnverifiedSingleSender} from 'fixtures/emailMigration'
import SingleSenderVerificationTable from '../EmailMigration/SingleSenderVerificationTable'

const integrations =
    migrationOutboundVerificationUnverifiedSingleSender.integrations

describe('SingleSenderVerificationTable', () => {
    const renderComponent = () =>
        render(
            <Provider store={mockStore({} as any)}>
                <SingleSenderVerificationTable
                    integrations={Array(10).fill(integrations[0])}
                    hasSubmittedBulkVerification={false}
                />
            </Provider>
        )

    afterEach(cleanup)

    it('should render only first 5 items', () => {
        renderComponent()
        expect(screen.getAllByTestId('sender-verification-row')).toHaveLength(5)
    })
})
