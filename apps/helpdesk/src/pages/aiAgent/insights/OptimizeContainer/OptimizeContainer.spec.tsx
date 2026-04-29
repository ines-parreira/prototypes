// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { useFlag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import type { Moment } from 'moment/moment'
import moment from 'moment/moment'

import { toImmutable } from 'common/utils'
import { account } from 'fixtures/account'
import { AdjustedPeriodFilter } from 'pages/aiAgent/insights/widgets/AdjustedPeriodFilter/AdjustedPeriodFilter'

import { IntentTableWidget } from '../IntentTableWidget/IntentTableWidget'
import { Level1IntentsPerformance } from '../widgets/Level1IntentsPerformance/Level1IntentsPerformance'
import {
    OptimizeContainer,
    subtractsPeriodWithoutData,
    subtractsPeriodWithoutDataIfNeeded,
} from './OptimizeContainer'

jest.mock(
    'pages/aiAgent/insights/widgets/AdjustedPeriodFilter/AdjustedPeriodFilter',
    () => ({
        AdjustedPeriodFilter: jest.fn(() => <></>),
    }),
)
jest.mock('../IntentTableWidget/IntentTableWidget', () => ({
    IntentTableWidget: jest.fn(() => <></>),
}))
jest.mock(
    '../widgets/Level1IntentsPerformance/Level1IntentsPerformance',
    () => ({
        Level1IntentsPerformance: jest.fn(() => <></>),
    }),
)
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled', () => ({
    useAiAgentEnabled: jest.fn().mockReturnValue(true),
}))
jest.mock('pages/aiAgent/insights/IntentTableWidget/IntentTableWidget', () => ({
    IntentTableWidget: jest.fn(() => <div>IntentTableWidget</div>),
}))
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: jest.fn(() => <></>),
}))
jest.mock('@repo/feature-flags')
const mockUseFlag = assumeMock(useFlag)
const defaultStore = {
    currentAccount: fromJS({
        ...account,
    }),
    stats: {
        filters: {
            period: {
                start_datetime: null,
                end_datetime: null,
            },
        },
    },
    billing: toImmutable({
        products: [],
    }),
    integrations: toImmutable({
        integrations: [],
    }),
}
const SHOP_NAME = 'shopify-store'
const SHOP_TYPE = 'shopify'
const renderComponent = () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-12-20T00:00:00Z'))
    render(<OptimizeContainer />, {
        path: `/:shopType/:shopName/ai-agent/optimize`,
        initialEntries: [`/${SHOP_TYPE}/${SHOP_NAME}/ai-agent/optimize`],
        storeState: defaultStore,
    })
}
describe('OptimizeContainer', () => {
    it('renders the component correctly', () => {
        renderComponent()
        expect(AdjustedPeriodFilter).toHaveBeenCalled()
        expect(Level1IntentsPerformance).toHaveBeenCalled()
        expect(IntentTableWidget).toHaveBeenCalled()
    })
    it('renders the component with the new page title', () => {
        mockUseFlag.mockImplementation(() => {
            return false
        })
        renderComponent()
        expect(screen.queryByText('Optimize')).not.toBeInTheDocument()
        expect(screen.getByText('Intents')).toBeInTheDocument()
    })
    describe('subtractsPeriodWithoutData', () => {
        it('should subtract 72 hours from the given moment date', () => {
            const inputDate: Moment = moment('2024-01-01T12:00:00.000Z')
            const expectedDate: Moment = moment('2023-12-29T12:00:00.000Z') // Subtract 72 hours
            const result = subtractsPeriodWithoutData(inputDate)
            expect(result.isSame(expectedDate)).toBe(true)
        })
    })
    describe('subtractsPeriodWithoutDataIfNeeded', () => {
        it('should subtract 72 hours if the date is after the threshold', () => {
            const inputDate: Moment = moment('2024-12-27T12:00:00.000Z')
            const expectedDate: Moment = moment('2024-12-24T12:00:00.000Z') // Subtract 72 hours
            const result = subtractsPeriodWithoutDataIfNeeded(inputDate)
            expect(result.isSame(expectedDate)).toBe(true)
        })
        it('should return the same date if the date is before the threshold', () => {
            const inputDate: Moment = moment('2023-12-28T12:00:00.000Z') // Before the threshold (72 hours before current time)
            const result = subtractsPeriodWithoutDataIfNeeded(inputDate)
            expect(result.isSame(inputDate)).toBe(true)
        })
    })
})
