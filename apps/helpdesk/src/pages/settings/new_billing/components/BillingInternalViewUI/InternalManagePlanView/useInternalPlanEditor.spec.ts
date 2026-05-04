import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    voicePlan1,
    voicePlan2,
    voicePlan3,
    voicePlan4,
} from 'fixtures/plans'
import type {
    CurrentPlans,
    InternalProductCatalogPlans,
} from 'models/billing/types'
import { ProductType } from 'models/billing/types'

import { useInternalPlanEditor } from './useInternalPlanEditor'

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
    return renderHook(() => useInternalPlanEditor(plans, catalog, undefined))
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

    it('resolves upgraded status when selecting a higher-price plan', () => {
        const { result } = renderUseInternalPlanEditor()

        act(() => {
            result.current.handlePlanSelect(
                ProductType.Helpdesk,
                proMonthlyHelpdeskPlan.plan_id,
            )
        })

        const helpdesk = findPlan(result, ProductType.Helpdesk)
        expect(helpdesk?.status).toBe('upgraded')
        expect(helpdesk?.plan).toEqual(proMonthlyHelpdeskPlan)
    })

    it('resolves downgraded status when selecting a lower-price plan', () => {
        const plansWithPro: CurrentPlans = {
            ...currentPlans,
            helpdesk: proMonthlyHelpdeskPlan,
        }
        const { result } = renderUseInternalPlanEditor(plansWithPro)

        act(() => {
            result.current.handlePlanSelect(
                ProductType.Helpdesk,
                basicMonthlyHelpdeskPlan.plan_id,
            )
        })

        const helpdesk = findPlan(result, ProductType.Helpdesk)
        expect(helpdesk?.status).toBe('downgraded')
    })

    it('toggles removed status and restores on second toggle', () => {
        const plansWithVoice: CurrentPlans = {
            ...currentPlans,
            voice: voicePlan1,
        }
        const { result } = renderUseInternalPlanEditor(plansWithVoice)

        act(() => {
            const voice = findPlan(result, ProductType.Voice)
            voice.action.onAction()
        })

        let voice = findPlan(result, ProductType.Voice)
        expect(voice?.status).toBe('removed')
        expect(voice?.plan).toBeNull()

        act(() => {
            voice = findPlan(result, ProductType.Voice)
            voice.action.onAction()
        })

        voice = findPlan(result, ProductType.Voice)
        expect(voice?.status).toBe('unchanged')
        expect(voice?.plan).toEqual(voicePlan1)
    })

    it('sets added status and auto-selects first catalog plan', () => {
        const { result } = renderUseInternalPlanEditor()

        act(() => {
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

    it('reverts to unchanged when undoing an add (add then remove)', () => {
        const { result } = renderUseInternalPlanEditor()

        act(() => {
            const voice = findPlan(result, ProductType.Voice)
            voice.action.onAction()
        })

        expect(result.current.hasChanges).toBe(true)

        act(() => {
            const voice = findPlan(result, ProductType.Voice)
            voice.action.onAction()
        })

        expect(result.current.hasChanges).toBe(false)
        const voice = findPlan(result, ProductType.Voice)
        expect(voice?.status).toBe('unchanged')
        expect(voice?.plan).toBeNull()
    })

    it('resolves changed status when selecting a same-price different plan', () => {
        const plansWithVoice: CurrentPlans = {
            ...currentPlans,
            voice: voicePlan3,
        }
        const catalogWithSamePrice: InternalProductCatalogPlans = {
            ...catalogPlans,
            [ProductType.Voice]: {
                [voicePlan3.plan_id]: voicePlan3,
                [voicePlan4.plan_id]: voicePlan4,
            },
        }
        const { result } = renderUseInternalPlanEditor(
            plansWithVoice,
            catalogWithSamePrice,
        )

        act(() => {
            result.current.handlePlanSelect(
                ProductType.Voice,
                voicePlan4.plan_id,
            )
        })

        const voice = findPlan(result, ProductType.Voice)
        expect(voice?.status).toBe('changed')
        expect(voice?.plan).toEqual(voicePlan4)
        expect(result.current.hasChanges).toBe(true)
    })

    it('hasChanges becomes true after any mutation', () => {
        const { result } = renderUseInternalPlanEditor()

        expect(result.current.hasChanges).toBe(false)

        act(() => {
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

        it('returns undo action for removed product', () => {
            const plansWithVoice: CurrentPlans = {
                ...currentPlans,
                voice: voicePlan1,
            }
            const { result } = renderUseInternalPlanEditor(plansWithVoice)

            act(() => {
                const voice = findPlan(result, ProductType.Voice)
                voice.action.onAction()
            })

            const voice = findPlan(result, ProductType.Voice)
            expect(voice?.action?.kind).toBe('undo')
            expect(voice?.action?.label).toBe('Undo')
        })

        it('returns remove action for newly added product', () => {
            const { result } = renderUseInternalPlanEditor()

            act(() => {
                const voice = findPlan(result, ProductType.Voice)
                voice.action.onAction()
            })

            const voice = findPlan(result, ProductType.Voice)
            expect(voice?.action?.kind).toBe('remove')
            expect(voice?.action?.label).toBe('Remove product')
        })
    })
})
