import {screen} from '@testing-library/react'
import React from 'react'

import {selfServiceConfiguration1} from 'fixtures/self_service_configurations'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {renderWithRouter} from 'utils/testing'

import CreateReportOrderIssueFlowScenarioView from '../CreateReportOrderIssueFlowScenarioView'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

describe('<CreateReportOrderIssueFlowScenarioView />', () => {
    beforeEach(() => {
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: selfServiceConfiguration1,
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })
    })

    it('should render order issue flow scenario view', () => {
        renderWithRouter(<CreateReportOrderIssueFlowScenarioView />)

        expect(screen.getByText('Create scenario')).toBeInTheDocument()
    })
})
