import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import {
    advancedMonthlyHelpdeskPlan,
    basicMonthlyHelpdeskPlan,
} from 'fixtures/plans'
import useAppSelector from 'hooks/useAppSelector'
import { useSubscription } from 'models/billing/queries'
import useScheduledChangesNotifications from 'pages/settings/new_billing/hooks/useScheduledChangesNotifications'

jest.mock('@repo/feature-flags')
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('models/billing/queries', () => ({
    useSubscription: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock
const mockUseSubscription = useSubscription as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

const BILLING_CYCLE_END = '2023-03-31T00:00:00Z'

const plansMap = {
    [basicMonthlyHelpdeskPlan.plan_id]: basicMonthlyHelpdeskPlan,
    [advancedMonthlyHelpdeskPlan.plan_id]: advancedMonthlyHelpdeskPlan,
}

beforeEach(() => {
    mockUseAppSelector.mockReturnValue(plansMap)
})

describe('useScheduledChangesNotifications — flag OFF (uses downgrades)', () => {
    beforeEach(() => {
        mockUseFlag.mockImplementation((key: FeatureFlagKey) =>
            key === FeatureFlagKey.ShowBillingRamps ? false : false,
        )
    })

    it('returns null scheduledUpdates and loading true while subscription is loading', () => {
        mockUseSubscription.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: null,
            loading: true,
            error: null,
        })
    })

    it('returns the error when the subscription request fails', () => {
        const error = new Error('Network error')
        mockUseSubscription.mockReturnValue({
            data: undefined,
            isLoading: false,
            error,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: null,
            loading: false,
            error,
        })
    })

    it('returns an empty array when there are no scheduled downgrades', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                current_billing_cycle_end_datetime: BILLING_CYCLE_END,
                downgrades: [],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: [],
            loading: false,
            error: null,
        })
    })

    it('maps a scheduled downgrade with a target plan correctly', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                current_billing_cycle_end_datetime: BILLING_CYCLE_END,
                downgrades: [
                    {
                        current_plan_id: advancedMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan: basicMonthlyHelpdeskPlan,
                    },
                ],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: [
                {
                    datetime: BILLING_CYCLE_END,
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: basicMonthlyHelpdeskPlan,
                },
            ],
            loading: false,
            error: null,
        })
    })

    it('maps a cancellation downgrade (targetPlan: null) correctly', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                current_billing_cycle_end_datetime: BILLING_CYCLE_END,
                downgrades: [
                    {
                        current_plan_id: advancedMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan: null,
                    },
                ],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: [
                {
                    datetime: BILLING_CYCLE_END,
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: null,
                },
            ],
            loading: false,
            error: null,
        })
    })

    it('filters out downgrades whose current plan is not in the plans map', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                current_billing_cycle_end_datetime: BILLING_CYCLE_END,
                downgrades: [
                    {
                        current_plan_id: 'unknown-plan-id',
                        scheduled_plan: basicMonthlyHelpdeskPlan,
                    },
                    {
                        current_plan_id: advancedMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan: basicMonthlyHelpdeskPlan,
                    },
                ],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: [
                {
                    datetime: BILLING_CYCLE_END,
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: basicMonthlyHelpdeskPlan,
                },
            ],
            loading: false,
            error: null,
        })
    })
})

describe('useScheduledChangesNotifications — flag ON (uses scheduled_changes)', () => {
    beforeEach(() => {
        mockUseFlag.mockImplementation((key: FeatureFlagKey) =>
            key === FeatureFlagKey.ShowBillingRamps ? true : false,
        )
    })

    it('returns an empty scheduledUpdates array when has_schedule is false', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                current_billing_cycle_end_datetime: BILLING_CYCLE_END,
                has_schedule: false,
                scheduled_changes: [],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: [],
            loading: false,
            error: null,
        })
    })

    it('returns an empty array when scheduled_change_types is empty', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                current_billing_cycle_end_datetime: BILLING_CYCLE_END,
                has_schedule: true,
                scheduled_changes: [
                    {
                        current_plan_id: advancedMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan: basicMonthlyHelpdeskPlan,
                        scheduled_change_types: [],
                    },
                ],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: [],
            loading: false,
            error: null,
        })
    })

    it('maps a DOWNGRADE scheduled change correctly', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                current_billing_cycle_end_datetime: BILLING_CYCLE_END,
                has_schedule: true,
                scheduled_changes: [
                    {
                        current_plan_id: advancedMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan: basicMonthlyHelpdeskPlan,
                        scheduled_change_types: ['DOWNGRADE'],
                    },
                ],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: [
                {
                    datetime: BILLING_CYCLE_END,
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: basicMonthlyHelpdeskPlan,
                    typeOfChange: 'DOWNGRADE',
                },
            ],
            loading: false,
            error: null,
        })
    })

    it('maps an UPGRADE scheduled change correctly', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                current_billing_cycle_end_datetime: BILLING_CYCLE_END,
                has_schedule: true,
                scheduled_changes: [
                    {
                        current_plan_id: basicMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan: advancedMonthlyHelpdeskPlan,
                        scheduled_change_types: ['UPGRADE'],
                    },
                ],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: [
                {
                    datetime: BILLING_CYCLE_END,
                    currentPlan: basicMonthlyHelpdeskPlan,
                    targetPlan: advancedMonthlyHelpdeskPlan,
                    typeOfChange: 'UPGRADE',
                },
            ],
            loading: false,
            error: null,
        })
    })

    it('maps a cancellation change (targetPlan: null) correctly', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                current_billing_cycle_end_datetime: BILLING_CYCLE_END,
                has_schedule: true,
                scheduled_changes: [
                    {
                        current_plan_id: advancedMonthlyHelpdeskPlan.plan_id,
                        scheduled_plan: null,
                        scheduled_change_types: ['DOWNGRADE'],
                    },
                ],
            },
            isLoading: false,
            error: undefined,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: [
                {
                    datetime: BILLING_CYCLE_END,
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: null,
                    typeOfChange: 'DOWNGRADE',
                },
            ],
            loading: false,
            error: null,
        })
    })

    it('returns the error when the subscription request fails', () => {
        const error = new Error('Network error')
        mockUseSubscription.mockReturnValue({
            data: undefined,
            isLoading: false,
            error,
        })

        const { result } = renderHook(() => useScheduledChangesNotifications())

        expect(result.current).toEqual({
            scheduledUpdates: [],
            loading: false,
            error,
        })
    })
})
