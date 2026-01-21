import { renderHook } from '@repo/testing'

import {
    advancedMonthlyHelpdeskPlan,
    basicMonthlyHelpdeskPlan,
} from 'fixtures/plans'
import useAppSelector from 'hooks/useAppSelector'
import { useSubscription } from 'models/billing/queries'
import useScheduledDowngrades from 'pages/settings/new_billing/hooks/useScheduledDowngrades'

jest.mock('hooks/useAppSelector', () => jest.fn())

jest.mock('models/billing/queries', () => ({
    useSubscription: jest.fn(),
}))

const mockUseSubscription = useSubscription as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

describe('useScheduledDowngrades', () => {
    const defaultSub = {
        current_billing_cycle_end_datetime: '2023-03-31T00:00:00Z',
        downgrades: [],
    }

    const plansMap = {
        [basicMonthlyHelpdeskPlan.plan_id]: basicMonthlyHelpdeskPlan,
        [advancedMonthlyHelpdeskPlan.plan_id]: advancedMonthlyHelpdeskPlan,
    }

    beforeEach(() => {
        mockUseAppSelector.mockReturnValue(plansMap)
    })

    it('should return a default state', () => {
        mockUseSubscription.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledDowngrades())
        expect(result.current).toEqual({
            value: null,
            loading: true,
            error: null,
        })
    })

    it('should return return an error if the request fails', () => {
        const error = new Error('Oh no!')
        mockUseSubscription.mockReturnValue({
            data: undefined,
            isLoading: false,
            error,
        })

        const { result } = renderHook(() => useScheduledDowngrades())

        expect(result.current).toEqual({
            value: null,
            loading: false,
            error,
        })
    })

    it('should return an empty array if no downgrades are scheduled', () => {
        mockUseSubscription.mockReturnValue({
            data: defaultSub,
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledDowngrades())

        expect(result.current).toEqual({
            loading: false,
            value: [],
            error: null,
        })
    })

    it('should return any downgrades that will still have a plan after the downgrade', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                ...defaultSub,
                downgrades: [
                    {
                        current_plan_id: advancedMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan_id: basicMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan: basicMonthlyHelpdeskPlan,
                    },
                ],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledDowngrades())

        expect(result.current).toEqual({
            loading: false,
            value: [
                {
                    datetime: defaultSub.current_billing_cycle_end_datetime,
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: basicMonthlyHelpdeskPlan,
                },
            ],
            error: null,
        })
    })

    it('should return downgrades that will no longer have a plan after the downgrade', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                ...defaultSub,
                downgrades: [
                    {
                        current_plan_id: advancedMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan_id: null,
                        scheduled_plan: null,
                    },
                ],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledDowngrades())

        expect(result.current).toEqual({
            loading: false,
            value: [
                {
                    datetime: defaultSub.current_billing_cycle_end_datetime,
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: null,
                },
            ],
            error: null,
        })
    })

    it('should filter out downgrades with missing current plans', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                ...defaultSub,
                downgrades: [
                    {
                        current_plan_id: 'non-existent-plan-id',
                        scheduled_plan_id: basicMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan: basicMonthlyHelpdeskPlan,
                    },
                    {
                        current_plan_id: advancedMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan_id: basicMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan: basicMonthlyHelpdeskPlan,
                    },
                ],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledDowngrades())

        expect(result.current).toEqual({
            loading: false,
            value: [
                {
                    datetime: defaultSub.current_billing_cycle_end_datetime,
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: basicMonthlyHelpdeskPlan,
                },
            ],
            error: null,
        })
    })
})
