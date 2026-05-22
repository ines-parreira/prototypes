import type { PlansByProduct, SelectedPlans } from '@repo/billing'
import { renderHook } from '@repo/testing'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    proMonthlyHelpdeskPlan,
    smsPlan1,
    voicePlan1,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'

import type { ConfirmChangesModalProps } from '../ConfirmChangesModal'
import { useConfirmChangesEstimate } from '../useConfirmChangesEstimate'

const mockUseFlag = jest.fn()
jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        MidCycleUpgradeBillingLogic: 'MidCycleUpgradeBillingLogic',
    },
    useFlag: (...args: unknown[]) => mockUseFlag(...args),
}))

const mockUseGetBillingEstimatesSubscription = jest.fn()
jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetBillingEstimatesSubscription: (...args: unknown[]) =>
        mockUseGetBillingEstimatesSubscription(...args),
}))

const baseSelectedPlans: SelectedPlans = {
    [ProductType.Helpdesk]: {
        plan: basicMonthlyHelpdeskPlan,
        isSelected: true,
    },
    [ProductType.Automation]: { isSelected: false },
    [ProductType.Voice]: { isSelected: false },
    [ProductType.SMS]: { isSelected: false },
    [ProductType.Convert]: { isSelected: false },
}

const basePlansByProduct: ConfirmChangesModalProps['plansByProduct'] = {
    [ProductType.Helpdesk]: {
        current: basicMonthlyHelpdeskPlan,
        available: [basicMonthlyHelpdeskPlan, proMonthlyHelpdeskPlan],
    },
    [ProductType.Automation]: {
        available: [basicMonthlyAutomationPlan],
    },
    [ProductType.Voice]: { available: [voicePlan1] },
    [ProductType.SMS]: { available: [smsPlan1] },
    [ProductType.Convert]: { available: [convertPlan1] },
}

describe('useConfirmChangesEstimate', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(true)
        mockUseGetBillingEstimatesSubscription.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })
    })

    it('disables query when modal is closed', () => {
        renderHook(() =>
            useConfirmChangesEstimate(
                false,
                baseSelectedPlans,
                basePlansByProduct,
                123,
            ),
        )

        expect(mockUseGetBillingEstimatesSubscription).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                query: expect.objectContaining({ enabled: false }),
            }),
        )
    })

    it('disables query when feature flag is off', () => {
        mockUseFlag.mockReturnValue(false)

        renderHook(() =>
            useConfirmChangesEstimate(
                true,
                baseSelectedPlans,
                basePlansByProduct,
                123,
            ),
        )

        expect(mockUseGetBillingEstimatesSubscription).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                query: expect.objectContaining({ enabled: false }),
            }),
        )
    })

    it('sends current plan IDs for products the user has not changed', () => {
        const selectedPlans: SelectedPlans = {
            ...baseSelectedPlans,
            [ProductType.Automation]: {
                plan: basicMonthlyAutomationPlan,
                isSelected: true,
            },
        }
        const plansByProduct: PlansByProduct = {
            ...basePlansByProduct,
            [ProductType.Automation]: {
                current: basicMonthlyAutomationPlan,
                available: [basicMonthlyAutomationPlan],
            },
        }

        renderHook(() =>
            useConfirmChangesEstimate(true, selectedPlans, plansByProduct, 456),
        )

        const params = mockUseGetBillingEstimatesSubscription.mock
            .calls[0][0] as Record<string, unknown>
        expect(params.new_helpdesk_plan_id).toBe(
            basicMonthlyHelpdeskPlan.plan_id,
        )
        expect(params.new_automate_plan_id).toBe(
            basicMonthlyAutomationPlan.plan_id,
        )
    })

    it('omits plan ID when a product is deselected (removal)', () => {
        const selectedPlans: SelectedPlans = {
            ...baseSelectedPlans,
            [ProductType.Automation]: {
                plan: basicMonthlyAutomationPlan,
                isSelected: false,
            },
        }
        const plansByProduct: PlansByProduct = {
            ...basePlansByProduct,
            [ProductType.Automation]: {
                current: basicMonthlyAutomationPlan,
                available: [basicMonthlyAutomationPlan],
            },
        }

        renderHook(() =>
            useConfirmChangesEstimate(true, selectedPlans, plansByProduct, 456),
        )

        const params = mockUseGetBillingEstimatesSubscription.mock
            .calls[0][0] as Record<string, unknown>
        expect(params.new_automate_plan_id).toBeUndefined()
    })

    it('sends selected plan ID when user has changed a product', () => {
        const plansWithUpgrade: SelectedPlans = {
            ...baseSelectedPlans,
            [ProductType.Helpdesk]: {
                plan: proMonthlyHelpdeskPlan,
                isSelected: true,
            },
        }

        renderHook(() =>
            useConfirmChangesEstimate(
                true,
                plansWithUpgrade,
                basePlansByProduct,
                456,
            ),
        )

        const params = mockUseGetBillingEstimatesSubscription.mock
            .calls[0][0] as Record<string, unknown>
        expect(params.new_helpdesk_plan_id).toBe(proMonthlyHelpdeskPlan.plan_id)
    })

    it('passes subscription_renewal_ramp_resource_version when provided', () => {
        renderHook(() =>
            useConfirmChangesEstimate(
                true,
                baseSelectedPlans,
                basePlansByProduct,
                100,
                200,
            ),
        )

        const params = mockUseGetBillingEstimatesSubscription.mock
            .calls[0][0] as Record<string, unknown>
        expect(params.subscription_resource_version).toBe(100)
        expect(params.subscription_renewal_ramp_resource_version).toBe(200)
    })

    it('passes reactivate=true when reactivate is true', () => {
        renderHook(() =>
            useConfirmChangesEstimate(
                true,
                baseSelectedPlans,
                basePlansByProduct,
                123,
                undefined,
                true,
            ),
        )

        const params = mockUseGetBillingEstimatesSubscription.mock
            .calls[0][0] as Record<string, unknown>
        expect(params.reactivate).toBe(true)
    })

    it('omits reactivate from params when not provided', () => {
        renderHook(() =>
            useConfirmChangesEstimate(
                true,
                baseSelectedPlans,
                basePlansByProduct,
                123,
            ),
        )

        const params = mockUseGetBillingEstimatesSubscription.mock
            .calls[0][0] as Record<string, unknown>
        expect(params.reactivate).toBeUndefined()
    })

    it('disables query when helpdesk has no current plan and no selection', () => {
        const noHelpdeskPlan: SelectedPlans = {
            ...baseSelectedPlans,
            [ProductType.Helpdesk]: { isSelected: false },
        }
        const noCurrent: PlansByProduct = {
            ...basePlansByProduct,
            [ProductType.Helpdesk]: {
                available: [basicMonthlyHelpdeskPlan],
            },
        }

        renderHook(() =>
            useConfirmChangesEstimate(true, noHelpdeskPlan, noCurrent, 123),
        )

        expect(mockUseGetBillingEstimatesSubscription).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                query: expect.objectContaining({ enabled: false }),
            }),
        )
    })
})
