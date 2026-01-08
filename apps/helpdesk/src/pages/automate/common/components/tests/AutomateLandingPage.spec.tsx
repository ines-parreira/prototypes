import type { MigrationStage } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { metricExecutionHandler } from 'domains/reporting/utils/metricExecutionHandler'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { billingState } from 'fixtures/billing'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import AutomateLandingPage from '../AutomateLandingPage'

jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
const mockGetNewStatsFeatureFlagMigration = assumeMock(
    getNewStatsFeatureFlagMigration,
)

jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')
const mockUseGetNewStatsFeatureFlagMigration = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)

jest.mock('domains/reporting/utils/metricExecutionHandler')
const mockMetricExecutionHandler = assumeMock(metricExecutionHandler)

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useCallbackRef: jest.fn(() => [null, jest.fn()]),
}))
jest.mock('hooks/candu/useInjectStyleToCandu', () => jest.fn())
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    __esModule: true,
    DrillDownModal: () => <div>DrillDownModal</div>,
}))

jest.mock('../TopQuestions/AutomateLandingPageTopQuestions', () => ({
    AutomateLandingPageTopQuestions: () => (
        <div>AutomateLandingPageTopQuestions</div>
    ),
}))

jest.mock('../TopQuestions/AutomateLandingPageTopQuestions', () => ({
    AutomateLandingPageTopQuestions: () => (
        <div>AutomateLandingPageTopQuestions</div>
    ),
}))

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
const store = mockStore({
    billing: fromJS(billingState),
} as unknown as RootState)

describe('AutomateLandingPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockGetNewStatsFeatureFlagMigration.mockResolvedValue(
            'complete' as MigrationStage,
        )

        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue(
            'complete' as MigrationStage,
        )

        mockMetricExecutionHandler.mockResolvedValue({
            data: {
                data: [{}],
            },
        } as any)
    })

    test('renders with title "Overview"', () => {
        renderWithQueryClientProvider(
            <Provider store={store}>
                <AutomateLandingPage />
            </Provider>,
        )
        expect(screen.getByText('Overview')).toBeInTheDocument()
    })
})
