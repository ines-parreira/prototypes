import { useCallback, useMemo, useState } from 'react'

import {
    getCorrespondingPlanAtCadencePair,
    getTotalWithDiscounts,
} from '@repo/billing'
import type { SelectedPlans } from '@repo/billing'

import type { DiscountVO } from '@gorgias/helpdesk-types'
import { InvoiceCadence } from '@gorgias/helpdesk-types'

import type {
    CurrentPlans,
    InternalProductCatalogPlans,
    Plan,
    PlanId,
} from 'models/billing/types'
import { Cadence, PRODUCT_TO_PLAN_KEY, ProductType } from 'models/billing/types'
import { getPlanPrice, isTrial } from 'models/billing/utils'

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

export type PriceSummary = {
    totalPriceInCents: number
    currentTotalPriceInCents: number
    totalWithDiscountsInCents: number
    discountAmountInCents: number
    hasDiscount: boolean
    totalChanged: boolean
    showStrikethrough: boolean
    strikethroughAmountInCents: number
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

function filterCatalogByCadence(
    catalogPlans: InternalProductCatalogPlans | undefined,
    contractCadence: Cadence,
    invoiceCadence: InvoiceCadence,
): InternalProductCatalogPlans {
    if (!catalogPlans) return {}
    const effectiveInvoiceCadence =
        contractCadence === Cadence.Month
            ? InvoiceCadence.Month
            : invoiceCadence
    return Object.values(ProductType).reduce<InternalProductCatalogPlans>(
        (acc, productType) => {
            const plans = catalogPlans[productType]
            if (!plans) return acc
            acc[productType] = Object.values(plans)
                .filter(
                    (plan) =>
                        plan.cadence === contractCadence &&
                        plan.invoice_cadence === effectiveInvoiceCadence,
                )
                .reduce<Record<PlanId, Plan>>(
                    (planAcc, plan) => ({ ...planAcc, [plan.plan_id]: plan }),
                    {},
                )
            return acc
        },
        {},
    )
}

function rematchTargetPlans(
    currentPlans: CurrentPlans | undefined,
    currentTargetPlans: Partial<Record<ProductType, PlanId>>,
    productChanges: Partial<Record<ProductType, ProductDraftState>>,
    catalogPlans: InternalProductCatalogPlans | undefined,
    newContractCadence: Cadence,
    newInvoiceCadence: InvoiceCadence,
): Partial<Record<ProductType, PlanId>> {
    const result: Partial<Record<ProductType, PlanId>> = {}

    for (const productType of Object.values(ProductType)) {
        const planKey = PRODUCT_TO_PLAN_KEY[productType]
        const currentPlan = currentPlans?.[planKey]
        const draftState = productChanges[productType]

        if (draftState === 'removed') continue
        if (currentPlan === null && draftState !== 'added') continue

        const productCatalog = catalogPlans?.[productType]
        if (!productCatalog || Object.keys(productCatalog).length === 0)
            continue

        const currentTargetPlanId = currentTargetPlans[productType]
        const referencePlan =
            (currentTargetPlanId
                ? productCatalog[currentTargetPlanId]
                : undefined) ??
            currentPlan ??
            undefined

        const matched = getCorrespondingPlanAtCadencePair({
            availablePlans: Object.values(productCatalog),
            currentPlan: referencePlan,
            subscriptionPlan: currentPlan ?? undefined,
            contractCadence: newContractCadence,
            invoiceCadence: newInvoiceCadence,
        })

        if (matched) {
            result[productType] = matched.plan_id
        }
    }

    return result
}

export function useInternalPlanEditor(
    currentPlans: CurrentPlans | undefined,
    catalogPlans: InternalProductCatalogPlans | undefined,
    discounts: DiscountVO[] | undefined,
    initialContractCadence: Cadence,
    initialInvoiceCadence: InvoiceCadence,
) {
    const [targetPlans, setTargetPlans] = useState<
        Partial<Record<ProductType, PlanId>>
    >({})
    const [productChanges, setProductChanges] = useState<
        Partial<Record<ProductType, ProductDraftState>>
    >({})
    const [contractCadence, setContractCadence] = useState<Cadence>(
        initialContractCadence,
    )
    const [invoiceCadence, setInvoiceCadence] = useState<InvoiceCadence>(
        initialInvoiceCadence,
    )

    const filteredCatalogPlans = useMemo(
        () =>
            filterCatalogByCadence(
                catalogPlans,
                contractCadence,
                invoiceCadence,
            ),
        [catalogPlans, contractCadence, invoiceCadence],
    )

    const handlePlanSelect = useCallback(
        (productType: ProductType, planId: PlanId) => {
            setTargetPlans((prev) => ({ ...prev, [productType]: planId }))
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
            const plans = filteredCatalogPlans?.[productType]
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
        [filteredCatalogPlans],
    )

    const handleContractCadenceChange = useCallback(
        (newCadence: Cadence) => {
            const newInvoiceCadence =
                newCadence === Cadence.Month
                    ? InvoiceCadence.Month
                    : invoiceCadence
            setContractCadence(newCadence)
            if (newCadence === Cadence.Month) {
                setInvoiceCadence(InvoiceCadence.Month)
            }
            setTargetPlans((prev) =>
                rematchTargetPlans(
                    currentPlans,
                    prev,
                    productChanges,
                    catalogPlans,
                    newCadence,
                    newInvoiceCadence,
                ),
            )
        },
        [currentPlans, catalogPlans, productChanges, invoiceCadence],
    )

    const handleInvoiceCadenceChange = useCallback(
        (newInvoiceCadence: InvoiceCadence) => {
            setInvoiceCadence(newInvoiceCadence)
            setTargetPlans((prev) =>
                rematchTargetPlans(
                    currentPlans,
                    prev,
                    productChanges,
                    catalogPlans,
                    contractCadence,
                    newInvoiceCadence,
                ),
            )
        },
        [currentPlans, catalogPlans, productChanges, contractCadence],
    )

    const resolvedPlans: ResolvedPlan[] = useMemo(() => {
        if (!currentPlans) return []

        return Object.values(ProductType).map((productType) => {
            const planKey = PRODUCT_TO_PLAN_KEY[productType]
            const currentPlan = currentPlans[planKey]
            const draftState = productChanges[productType]
            const productCatalog = filteredCatalogPlans?.[productType]

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
        filteredCatalogPlans,
        targetPlans,
        productChanges,
        handleToggleRemoval,
        handleUndoAdd,
        handleAddProduct,
    ])

    const hasChanges = resolvedPlans.some(
        ({ status }) => status !== 'unchanged',
    )

    const priceSummary = useMemo<PriceSummary>(
        () => derivePriceSummary(resolvedPlans, discounts),
        [resolvedPlans, discounts],
    )

    return {
        targetPlans,
        resolvedPlans,
        hasChanges,
        priceSummary,
        contractCadence,
        invoiceCadence,
        filteredCatalogPlans,
        handlePlanSelect,
        handleContractCadenceChange,
        handleInvoiceCadenceChange,
    }
}

export function derivePriceSummary(
    resolvedPlans: ResolvedPlan[],
    discounts: DiscountVO[] | undefined,
): PriceSummary {
    const currentTotalPriceInCents = resolvedPlans.reduce(
        (sum, { currentPlan }) => {
            if (!currentPlan || isTrial(currentPlan)) return sum
            return sum + currentPlan.amount
        },
        0,
    )

    const selectedPlans = Object.fromEntries(
        resolvedPlans.map(({ productType, plan }) => [
            productType,
            {
                plan: plan ?? undefined,
                isSelected: Boolean(plan && !isTrial(plan)),
            },
        ]),
    ) as SelectedPlans

    const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
        getTotalWithDiscounts(selectedPlans, discounts ?? [])

    const hasDiscount = discountAmount > 0
    const totalChanged = totalWithoutDiscounts !== currentTotalPriceInCents

    return {
        totalPriceInCents: totalWithoutDiscounts,
        currentTotalPriceInCents,
        totalWithDiscountsInCents: totalWithDiscounts,
        discountAmountInCents: discountAmount,
        hasDiscount,
        totalChanged,
        showStrikethrough: hasDiscount || totalChanged,
        strikethroughAmountInCents: hasDiscount
            ? totalWithoutDiscounts
            : currentTotalPriceInCents,
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
