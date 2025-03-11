import { act, renderHook } from '@testing-library/react-hooks'

import {
    advancedMonthlyHelpdeskPlan,
    basicMonthlyHelpdeskPlan,
} from 'fixtures/productPrices'
import useAppSelector from 'hooks/useAppSelector'
import { fetchSubscription } from 'models/billing/resources'
import useScheduledDowngrades from 'pages/settings/new_billing/hooks/useScheduledDowngrades'

jest.mock('hooks/useAppSelector', () => jest.fn())

jest.mock('models/billing/resources', () => ({
    fetchSubscription: jest.fn(),
}))

const mockFetchSubscription = fetchSubscription as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

describe('useScheduledDowngrades', () => {
    let promise
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let reject = (..._args: any[]): any => null
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let resolve = (..._args: any[]): any => null

    const defaultSub = {
        current_billing_cycle_end_datetime: '2023-03-31T00:00:00Z',
        downgrades: [],
    }

    const plansMap = {
        [basicMonthlyHelpdeskPlan.plan_id]: basicMonthlyHelpdeskPlan,
        [advancedMonthlyHelpdeskPlan.plan_id]: advancedMonthlyHelpdeskPlan,
    }

    beforeEach(() => {
        promise = new Promise((internalResolve, internalReject) => {
            resolve = internalResolve
            reject = internalReject
        })
        mockFetchSubscription.mockReturnValue(promise)
        mockUseAppSelector.mockReturnValueOnce(plansMap)
    })

    it('should return a default state', () => {
        const { result } = renderHook(() => useScheduledDowngrades())
        expect(result.current).toEqual({ loading: true })
    })

    it('should return return an error if the request fails', async () => {
        const { result } = renderHook(() => useScheduledDowngrades())

        const error = new Error('Oh no!')
        await act(async () => {
            await reject(error)
        })

        expect(result.current).toEqual({ error, loading: false })
    })

    it('should return an empty array if no downgrades are scheduled', async () => {
        const { result } = renderHook(() => useScheduledDowngrades())

        await act(async () => {
            await resolve(defaultSub)
        })

        expect(result.current).toEqual({ loading: false, value: [] })
    })

    it('should return any downgrades that will still have a plan after the downgrade', async () => {
        const { result } = renderHook(() => useScheduledDowngrades())

        await act(async () => {
            await resolve({
                ...defaultSub,
                downgrades: [
                    {
                        current_plan_id: advancedMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan_id: basicMonthlyHelpdeskPlan.plan_id,
                    },
                ],
            })
        })

        expect(result.current).toEqual({
            loading: false,
            value: [
                {
                    datetime: defaultSub.current_billing_cycle_end_datetime,
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: basicMonthlyHelpdeskPlan,
                },
            ],
        })
    })

    it('should return downgrades that will no longer have a plan after the downgrade', async () => {
        const { result } = renderHook(() => useScheduledDowngrades())

        await act(async () => {
            await resolve({
                ...defaultSub,
                downgrades: [
                    {
                        current_plan_id: advancedMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan_id: null,
                    },
                ],
            })
        })

        expect(result.current).toEqual({
            loading: false,
            value: [
                {
                    datetime: defaultSub.current_billing_cycle_end_datetime,
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: null,
                },
            ],
        })
    })
})
