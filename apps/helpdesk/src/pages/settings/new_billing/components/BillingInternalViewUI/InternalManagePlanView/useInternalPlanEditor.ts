import { useCallback, useMemo, useState } from 'react'

import type {
    CurrentPlans,
    InternalProductCatalogPlans,
    Plan,
    PlanId,
} from 'models/billing/types'
import { PRODUCT_TO_PLAN_KEY, ProductType } from 'models/billing/types'
import { getPlanPrice } from 'models/billing/utils'

export type ResolvedPlanStatus =
    | 'unchanged'
    | 'changed'
    | 'upgraded'
    | 'downgraded'
    | 'added'
    | 'removed'

type ProductDraftState = 'added' | 'removed'

export type ProductAction = {
    kind: 'add' | 'remove' | 'undo'
    label: string
    onAction: () => void
}

export type ResolvedPlan = {
    productType: ProductType
    plan: Plan | null
    currentPlan: Plan | null
    status: ResolvedPlanStatus
    action: ProductAction | null
}

function resolveStatus(
    currentPlan: Plan | null,
    targetPlanId: PlanId | undefined,
    catalogPlans: Record<PlanId, Plan> | undefined,
    draftState: ProductDraftState | undefined,
): ResolvedPlanStatus {
    if (draftState === 'removed') return 'removed'
    if (draftState === 'added') return 'added'

    if (!targetPlanId || !catalogPlans || !currentPlan) return 'unchanged'
    if (targetPlanId === currentPlan.plan_id) return 'unchanged'

    const targetPlan = catalogPlans[targetPlanId]
    if (!targetPlan) return 'unchanged'

    const priceDiff = getPlanPrice(targetPlan) - getPlanPrice(currentPlan)
    if (priceDiff > 0) return 'upgraded'
    if (priceDiff < 0) return 'downgraded'
    return 'changed'
}

function resolveDisplayPlan(
    currentPlan: Plan | null,
    targetPlanId: PlanId | undefined,
    catalogPlans: Record<PlanId, Plan> | undefined,
    draftState: ProductDraftState | undefined,
): Plan | null {
    if (draftState === 'removed') return null
    if (targetPlanId && catalogPlans?.[targetPlanId]) {
        return catalogPlans[targetPlanId]
    }
    return currentPlan
}

export function useInternalPlanEditor(
    currentPlans: CurrentPlans | undefined,
    catalogPlans: InternalProductCatalogPlans | undefined,
) {
    const [targetPlans, setTargetPlans] = useState<
        Partial<Record<ProductType, PlanId>>
    >({})
    const [productChanges, setProductChanges] = useState<
        Partial<Record<ProductType, ProductDraftState>>
    >({})

    const handlePlanSelect = useCallback(
        (productType: ProductType, planId: PlanId) => {
            setTargetPlans((prev) => ({ ...prev, [productType]: planId }))
            // If the user selects a plan for a product marked for removal, un-mark it
            setProductChanges((prev) => {
                if (prev[productType] !== 'removed') return prev
                const { [productType]: __, ...rest } = prev
                return rest
            })
        },
        [],
    )

    const handleUndoAdd = useCallback((productType: ProductType) => {
        setProductChanges((prev) => {
            const { [productType]: __, ...rest } = prev
            return rest
        })
        setTargetPlans((prev) => {
            const { [productType]: __, ...rest } = prev
            return rest
        })
    }, [])

    const handleToggleRemoval = useCallback((productType: ProductType) => {
        setProductChanges((prev) => {
            if (prev[productType] === 'removed') {
                const { [productType]: __, ...rest } = prev
                return rest
            }
            return { ...prev, [productType]: 'removed' }
        })
    }, [])

    const handleAddProduct = useCallback(
        (productType: ProductType) => {
            setProductChanges((prev) => ({
                ...prev,
                [productType]: 'added',
            }))
            const plans = catalogPlans?.[productType]
            if (plans) {
                const firstPlanId = Object.keys(plans)[0] as PlanId | undefined
                if (firstPlanId) {
                    setTargetPlans((prev) => ({
                        ...prev,
                        [productType]: firstPlanId,
                    }))
                }
            }
        },
        [catalogPlans],
    )

    const resolvedPlans: ResolvedPlan[] = useMemo(() => {
        if (!currentPlans) return []

        return Object.values(ProductType).map((productType) => {
            const planKey = PRODUCT_TO_PLAN_KEY[productType]
            const currentPlan = currentPlans[planKey]
            const draftState = productChanges[productType]
            const productCatalog = catalogPlans?.[productType]

            const plan = resolveDisplayPlan(
                currentPlan,
                targetPlans[productType],
                productCatalog,
                draftState,
            )
            const status = resolveStatus(
                currentPlan,
                targetPlans[productType],
                productCatalog,
                draftState,
            )

            const action = resolveAction({
                productType,
                currentPlan,
                draftState,
                onToggleRemoval: () => handleToggleRemoval(productType),
                onUndoAdd: () => handleUndoAdd(productType),
                onAdd: () => handleAddProduct(productType),
            })

            return { productType, plan, currentPlan, status, action }
        })
    }, [
        currentPlans,
        catalogPlans,
        targetPlans,
        productChanges,
        handleToggleRemoval,
        handleUndoAdd,
        handleAddProduct,
    ])

    const hasChanges = resolvedPlans.some(
        ({ status }) => status !== 'unchanged',
    )

    return {
        targetPlans,
        resolvedPlans,
        hasChanges,
        handlePlanSelect,
    }
}

function resolveAction({
    productType,
    currentPlan,
    draftState,
    onToggleRemoval,
    onUndoAdd,
    onAdd,
}: {
    productType: ProductType
    currentPlan: Plan | null
    draftState: ProductDraftState | undefined
    onToggleRemoval: () => void
    onUndoAdd: () => void
    onAdd: () => void
}): ProductAction | null {
    if (productType === ProductType.Helpdesk) return null

    if (currentPlan !== null) {
        return draftState === 'removed'
            ? { kind: 'undo', label: 'Undo', onAction: onToggleRemoval }
            : {
                  kind: 'remove',
                  label: 'Remove product',
                  onAction: onToggleRemoval,
              }
    }

    return draftState === 'added'
        ? { kind: 'remove', label: 'Remove product', onAction: onUndoAdd }
        : { kind: 'add', label: '+ Add Product', onAction: onAdd }
}
