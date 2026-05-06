import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { InvoiceCadence } from '@gorgias/helpdesk-types'
import type { DiscountVO } from '@gorgias/helpdesk-types'

import {
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    basicYearlyInvoicedMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    proYearlyHelpdeskPlan,
    voicePlan0,
    voicePlan1,
    voicePlan2,
} from 'fixtures/plans'
import type {
    CurrentPlans,
    InternalProductCatalogPlans,
} from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'

import {
    derivePriceSummary,
    useInternalPlanEditor,
} from './useInternalPlanEditor'
import type { ResolvedPlan } from './useInternalPlanEditor'

const currentPlans: CurrentPlans = {
    helpdesk: basicMonthlyHelpdeskPlan,
    automate: null,
    voice: null,
    sms: null,
    convert: null,
}

const catalogPlans: InternalProductCatalogPlans = {
    [ProductType.Helpdesk]: {
        [basicMonthlyHelpdeskPlan.plan_id]: basicMonthlyHelpdeskPlan,
        [proMonthlyHelpdeskPlan.plan_id]: proMonthlyHelpdeskPlan,
    },
    [ProductType.Voice]: {
        [voicePlan1.plan_id]: voicePlan1,
        [voicePlan2.plan_id]: voicePlan2,
    },
}

function renderUseInternalPlanEditor(
    plans: CurrentPlans | undefined = currentPlans,
    catalog: InternalProductCatalogPlans | undefined = catalogPlans,
) {
    return renderHook(() =>
        useInternalPlanEditor(
            plans,
            catalog,
            undefined,
            Cadence.Month,
            InvoiceCadence.Month,
        ),
    )
}

function findPlan(result: any, productType: ProductType) {
    return result.current.resolvedPlans.find(
        (p: any) => p.productType === productType,
    )
}

describe('useInternalPlanEditor', () => {
    it('returns 5 resolved plans all unchanged on init', () => {
        const { result } = renderUseInternalPlanEditor()

        expect(result.current.resolvedPlans).toHaveLength(5)
        expect(
            result.current.resolvedPlans.every(
                ({ status }) => status === 'unchanged',
            ),
        ).toBe(true)
        expect(result.current.hasChanges).toBe(false)
    })

    it('resolves upgraded status when selecting a higher-price plan', async () => {
        const { result } = renderUseInternalPlanEditor()

        await act(() => {
            result.current.handlePlanSelect(
                ProductType.Helpdesk,
                proMonthlyHelpdeskPlan.plan_id,
            )
        })

        const helpdesk = findPlan(result, ProductType.Helpdesk)
        expect(helpdesk?.status).toBe('upgraded')
        expect(helpdesk?.plan).toEqual(proMonthlyHelpdeskPlan)
    })

    it('resolves downgraded status when selecting a lower-price plan', async () => {
        const plansWithPro: CurrentPlans = {
            ...currentPlans,
            helpdesk: proMonthlyHelpdeskPlan,
        }
        const { result } = renderUseInternalPlanEditor(plansWithPro)

        await act(() => {
            result.current.handlePlanSelect(
                ProductType.Helpdesk,
                basicMonthlyHelpdeskPlan.plan_id,
            )
        })

        const helpdesk = findPlan(result, ProductType.Helpdesk)
        expect(helpdesk?.status).toBe('downgraded')
    })

    it('toggles removed status and restores on second toggle', async () => {
        const plansWithVoice: CurrentPlans = {
            ...currentPlans,
            voice: voicePlan1,
        }
        const { result } = renderUseInternalPlanEditor(plansWithVoice)

        await act(() => {
            const voice = findPlan(result, ProductType.Voice)
            voice.action.onAction()
        })

        let voice = findPlan(result, ProductType.Voice)
        expect(voice?.status).toBe('removed')
        expect(voice?.plan).toBeNull()

        await act(() => {
            voice = findPlan(result, ProductType.Voice)
            voice.action.onAction()
        })

        voice = findPlan(result, ProductType.Voice)
        expect(voice?.status).toBe('unchanged')
        expect(voice?.plan).toEqual(voicePlan1)
    })

    it('sets added status and auto-selects first catalog plan', async () => {
        const { result } = renderUseInternalPlanEditor()

        await act(() => {
            const voice = findPlan(result, ProductType.Voice)
            voice.action.onAction()
        })

        const voice = findPlan(result, ProductType.Voice)
        expect(voice?.status).toBe('added')
        expect(voice?.plan).toEqual(voicePlan1)
        expect(result.current.targetPlans[ProductType.Voice]).toBe(
            voicePlan1.plan_id,
        )
    })

    it('reverts to unchanged when undoing an add (add then remove)', async () => {
        const { result } = renderUseInternalPlanEditor()

        expect(result.current.hasChanges).toBe(false)

        await act(() => {
            const voice = findPlan(result, ProductType.Voice)
            voice.action.onAction()
        })

        expect(result.current.hasChanges).toBe(true)

        await act(() => {
            const voice = findPlan(result, ProductType.Voice)
            voice.action.onAction()
        })

        expect(result.current.hasChanges).toBe(false)
        const voice = findPlan(result, ProductType.Voice)
        expect(voice?.status).toBe('unchanged')
        expect(voice?.plan).toBeNull()
    })

    it('resolves changed status when selecting a same-price different plan', async () => {
        const samePricePlanA = {
            ...voicePlan1,
            plan_id: 'voc-same-price-a-monthly',
            amount: 500,
        }
        const samePricePlanB = {
            ...voicePlan1,
            plan_id: 'voc-same-price-b-monthly',
            amount: 500,
        }
        const plansWithVoice: CurrentPlans = {
            ...currentPlans,
            voice: samePricePlanA,
        }
        const catalogWithSamePrice: InternalProductCatalogPlans = {
            ...catalogPlans,
            [ProductType.Voice]: {
                [samePricePlanA.plan_id]: samePricePlanA,
                [samePricePlanB.plan_id]: samePricePlanB,
            },
        }
        const { result } = renderUseInternalPlanEditor(
            plansWithVoice,
            catalogWithSamePrice,
        )

        await act(() => {
            result.current.handlePlanSelect(
                ProductType.Voice,
                samePricePlanB.plan_id,
            )
        })

        const voice = findPlan(result, ProductType.Voice)
        expect(voice?.status).toBe('changed')
        expect(voice?.plan).toEqual(samePricePlanB)
        expect(result.current.hasChanges).toBe(true)
    })

    it('hasChanges becomes true after any mutation', async () => {
        const { result } = renderUseInternalPlanEditor()

        expect(result.current.hasChanges).toBe(false)

        await act(() => {
            result.current.handlePlanSelect(
                ProductType.Helpdesk,
                proMonthlyHelpdeskPlan.plan_id,
            )
        })

        expect(result.current.hasChanges).toBe(true)
    })

    describe('action field', () => {
        it('returns null action for Helpdesk', () => {
            const { result } = renderUseInternalPlanEditor()

            const helpdesk = findPlan(result, ProductType.Helpdesk)
            expect(helpdesk?.action).toBeNull()
        })

        it('returns add action for inactive product without a plan', () => {
            const { result } = renderUseInternalPlanEditor()

            const voice = findPlan(result, ProductType.Voice)
            expect(voice?.action?.kind).toBe('add')
            expect(voice?.action?.label).toBe('+ Add Product')
        })

        it('returns remove action for active product with a plan', () => {
            const plansWithVoice: CurrentPlans = {
                ...currentPlans,
                voice: voicePlan1,
            }
            const { result } = renderUseInternalPlanEditor(plansWithVoice)

            const voice = findPlan(result, ProductType.Voice)
            expect(voice?.action?.kind).toBe('remove')
            expect(voice?.action?.label).toBe('Remove product')
        })

        it('returns undo action for removed product', async () => {
            const plansWithVoice: CurrentPlans = {
                ...currentPlans,
                voice: voicePlan1,
            }
            const { result } = renderUseInternalPlanEditor(plansWithVoice)

            await act(() => {
                const voice = findPlan(result, ProductType.Voice)
                voice.action.onAction()
            })

            const voice = findPlan(result, ProductType.Voice)
            expect(voice?.action?.kind).toBe('undo')
            expect(voice?.action?.label).toBe('Undo')
        })

        it('returns remove action for newly added product', async () => {
            const { result } = renderUseInternalPlanEditor()

            await act(() => {
                const voice = findPlan(result, ProductType.Voice)
                voice.action.onAction()
            })

            const voice = findPlan(result, ProductType.Voice)
            expect(voice?.action?.kind).toBe('remove')
            expect(voice?.action?.label).toBe('Remove product')
        })
    })

    it('returns empty resolvedPlans when currentPlans is undefined', () => {
        const { result } = renderHook(() =>
            useInternalPlanEditor(
                undefined,
                catalogPlans,
                undefined,
                Cadence.Month,
                InvoiceCadence.Month,
            ),
        )

        expect(result.current.resolvedPlans).toHaveLength(0)
        expect(result.current.hasChanges).toBe(false)
    })

    it('clears removed state when a plan is selected for a previously removed product', async () => {
        const plansWithVoice: CurrentPlans = {
            ...currentPlans,
            voice: voicePlan1,
        }
        const { result } = renderUseInternalPlanEditor(plansWithVoice)

        await act(() => {
            findPlan(result, ProductType.Voice).action.onAction()
        })
        expect(findPlan(result, ProductType.Voice)?.status).toBe('removed')

        await act(() => {
            result.current.handlePlanSelect(
                ProductType.Voice,
                voicePlan2.plan_id,
            )
        })

        const voice = findPlan(result, ProductType.Voice)
        expect(voice?.status).not.toBe('removed')
        expect(voice?.plan).toEqual(voicePlan2)
    })
})

describe('handleContractCadenceChange', () => {
    const yearlyCurrentPlans: CurrentPlans = {
        helpdesk: proYearlyHelpdeskPlan,
        automate: null,
        voice: null,
        sms: null,
        convert: null,
    }

    const mixedCadenceCatalog: InternalProductCatalogPlans = {
        [ProductType.Helpdesk]: {
            [proMonthlyHelpdeskPlan.plan_id]: proMonthlyHelpdeskPlan,
            [proYearlyHelpdeskPlan.plan_id]: proYearlyHelpdeskPlan,
        },
    }

    function renderWithYearlyCadence() {
        return renderHook(() =>
            useInternalPlanEditor(
                yearlyCurrentPlans,
                mixedCadenceCatalog,
                undefined,
                Cadence.Year,
                InvoiceCadence.Year,
            ),
        )
    }

    it('updates contractCadence state', async () => {
        const { result } = renderWithYearlyCadence()

        await act(() => {
            result.current.handleContractCadenceChange(Cadence.Month)
        })

        expect(result.current.contractCadence).toBe(Cadence.Month)
    })

    it('forces invoiceCadence to Month when switching to monthly contract', async () => {
        const { result } = renderWithYearlyCadence()

        await act(() => {
            result.current.handleContractCadenceChange(Cadence.Month)
        })

        expect(result.current.invoiceCadence).toBe(InvoiceCadence.Month)
    })

    it('remaps target plans to the equivalent plan at the new cadence', async () => {
        const { result } = renderWithYearlyCadence()

        await act(() => {
            result.current.handleContractCadenceChange(Cadence.Month)
        })

        expect(result.current.targetPlans[ProductType.Helpdesk]).toBe(
            proMonthlyHelpdeskPlan.plan_id,
        )
    })

    it('filters filteredCatalogPlans to only plans at the new cadence', async () => {
        const { result } = renderWithYearlyCadence()

        await act(() => {
            result.current.handleContractCadenceChange(Cadence.Month)
        })

        const helpdeskPlans =
            result.current.filteredCatalogPlans[ProductType.Helpdesk]
        expect(helpdeskPlans).toBeDefined()
        expect(Object.values(helpdeskPlans!)).toEqual(
            expect.arrayContaining([proMonthlyHelpdeskPlan]),
        )
        expect(Object.values(helpdeskPlans!)).not.toEqual(
            expect.arrayContaining([proYearlyHelpdeskPlan]),
        )
    })

    it('preserves the existing invoice cadence when switching to a non-monthly contract', async () => {
        const monthlyCurrentPlans: CurrentPlans = {
            helpdesk: basicMonthlyHelpdeskPlan,
            automate: null,
            voice: null,
            sms: null,
            convert: null,
        }
        const catalog: InternalProductCatalogPlans = {
            [ProductType.Helpdesk]: {
                [basicMonthlyHelpdeskPlan.plan_id]: basicMonthlyHelpdeskPlan,
                [basicYearlyHelpdeskPlan.plan_id]: basicYearlyHelpdeskPlan,
            },
        }
        const { result } = renderHook(() =>
            useInternalPlanEditor(
                monthlyCurrentPlans,
                catalog,
                undefined,
                Cadence.Month,
                InvoiceCadence.Month,
            ),
        )

        await act(() => {
            result.current.handleContractCadenceChange(Cadence.Year)
        })

        expect(result.current.contractCadence).toBe(Cadence.Year)
        expect(result.current.invoiceCadence).toBe(InvoiceCadence.Month)
    })
})

describe('handleInvoiceCadenceChange', () => {
    const yearlyCurrentPlans: CurrentPlans = {
        helpdesk: basicYearlyHelpdeskPlan,
        automate: null,
        voice: null,
        sms: null,
        convert: null,
    }

    const catalogWithInvoicedMonthly: InternalProductCatalogPlans = {
        [ProductType.Helpdesk]: {
            [basicYearlyHelpdeskPlan.plan_id]: basicYearlyHelpdeskPlan,
            [basicYearlyInvoicedMonthlyHelpdeskPlan.plan_id]:
                basicYearlyInvoicedMonthlyHelpdeskPlan,
        },
    }

    function renderWithYearlyYearlyCadence() {
        return renderHook(() =>
            useInternalPlanEditor(
                yearlyCurrentPlans,
                catalogWithInvoicedMonthly,
                undefined,
                Cadence.Year,
                InvoiceCadence.Year,
            ),
        )
    }

    it('updates invoiceCadence state', async () => {
        const { result } = renderWithYearlyYearlyCadence()

        await act(() => {
            result.current.handleInvoiceCadenceChange(InvoiceCadence.Month)
        })

        expect(result.current.invoiceCadence).toBe(InvoiceCadence.Month)
    })

    it('remaps target plans to the equivalent plan at the new invoice cadence', async () => {
        const { result } = renderWithYearlyYearlyCadence()

        await act(() => {
            result.current.handleInvoiceCadenceChange(InvoiceCadence.Month)
        })

        expect(result.current.targetPlans[ProductType.Helpdesk]).toBe(
            basicYearlyInvoicedMonthlyHelpdeskPlan.plan_id,
        )
    })

    it('filters filteredCatalogPlans to plans with the new invoice cadence', async () => {
        const { result } = renderWithYearlyYearlyCadence()

        await act(() => {
            result.current.handleInvoiceCadenceChange(InvoiceCadence.Month)
        })

        const helpdeskPlans =
            result.current.filteredCatalogPlans[ProductType.Helpdesk]
        expect(helpdeskPlans).toBeDefined()
        expect(Object.values(helpdeskPlans!)).toEqual(
            expect.arrayContaining([basicYearlyInvoicedMonthlyHelpdeskPlan]),
        )
        expect(Object.values(helpdeskPlans!)).not.toEqual(
            expect.arrayContaining([basicYearlyHelpdeskPlan]),
        )
    })
})

describe('derivePriceSummary', () => {
    function makeResolved(
        overrides: Partial<ResolvedPlan> & { productType: ProductType },
    ): ResolvedPlan {
        return {
            plan: null,
            currentPlan: null,
            status: 'unchanged',
            action: null,
            ...overrides,
        }
    }

    it('returns zero totals when no plans are provided', () => {
        const summary = derivePriceSummary([], undefined)

        expect(summary.totalPriceInCents).toBe(0)
        expect(summary.currentTotalPriceInCents).toBe(0)
        expect(summary.totalWithDiscountsInCents).toBe(0)
        expect(summary.discountAmountInCents).toBe(0)
        expect(summary.hasDiscount).toBe(false)
        expect(summary.totalChanged).toBe(false)
        expect(summary.showStrikethrough).toBe(false)
    })

    it('computes correct totals with unchanged plans and no discount', () => {
        const plans = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
                status: 'unchanged',
            }),
        ]

        const summary = derivePriceSummary(plans, [])

        expect(summary.totalPriceInCents).toBe(basicMonthlyHelpdeskPlan.amount)
        expect(summary.currentTotalPriceInCents).toBe(
            basicMonthlyHelpdeskPlan.amount,
        )
        expect(summary.hasDiscount).toBe(false)
        expect(summary.totalChanged).toBe(false)
        expect(summary.showStrikethrough).toBe(false)
    })

    it('sets totalChanged and showStrikethrough when new total differs from current', () => {
        const plans = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: proMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
                status: 'upgraded',
            }),
        ]

        const summary = derivePriceSummary(plans, [])

        expect(summary.totalChanged).toBe(true)
        expect(summary.showStrikethrough).toBe(true)
        expect(summary.strikethroughAmountInCents).toBe(
            basicMonthlyHelpdeskPlan.amount,
        )
        expect(summary.totalPriceInCents).toBe(proMonthlyHelpdeskPlan.amount)
    })

    it('applies percentage discount and sets hasDiscount', () => {
        const plans = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: proMonthlyHelpdeskPlan,
                currentPlan: proMonthlyHelpdeskPlan,
                status: 'unchanged',
            }),
        ]
        const discount: DiscountVO = {
            discount_applicability: 1,
            discount_object_type: 1,
            discount_type: 'percentage' as DiscountVO['discount_type'],
            percent_off: 10,
            products: [],
        }

        const summary = derivePriceSummary(plans, [discount])

        expect(summary.hasDiscount).toBe(true)
        expect(summary.discountAmountInCents).toBe(
            proMonthlyHelpdeskPlan.amount * 0.1,
        )
        expect(summary.totalWithDiscountsInCents).toBe(
            proMonthlyHelpdeskPlan.amount * 0.9,
        )
        expect(summary.showStrikethrough).toBe(true)
        expect(summary.strikethroughAmountInCents).toBe(
            proMonthlyHelpdeskPlan.amount,
        )
    })

    it('excludes trial plans from currentTotalPriceInCents', () => {
        const plans = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
                status: 'unchanged',
            }),
            makeResolved({
                productType: ProductType.Voice,
                plan: voicePlan0,
                currentPlan: voicePlan0,
                status: 'unchanged',
            }),
        ]

        const summary = derivePriceSummary(plans, [])

        expect(summary.currentTotalPriceInCents).toBe(
            basicMonthlyHelpdeskPlan.amount,
        )
        expect(summary.totalPriceInCents).toBe(basicMonthlyHelpdeskPlan.amount)
    })

    it('uses totalWithoutDiscounts as strikethroughAmount when a discount is active', () => {
        const plans = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: proMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
                status: 'upgraded',
            }),
        ]
        const discount: DiscountVO = {
            discount_applicability: 1,
            discount_object_type: 1,
            discount_type: 'percentage' as DiscountVO['discount_type'],
            percent_off: 20,
            products: [],
        }

        const summary = derivePriceSummary(plans, [discount])

        expect(summary.hasDiscount).toBe(true)
        expect(summary.totalChanged).toBe(true)
        expect(summary.strikethroughAmountInCents).toBe(
            proMonthlyHelpdeskPlan.amount,
        )
    })
})
