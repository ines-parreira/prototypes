import { InvoiceCadence } from '@gorgias/helpdesk-types'

import { Cadence } from '../types'
import type { Plan } from '../types'
import { getCadenceName } from './getCadenceName'
import { getInvoiceCadenceName } from './getInvoiceCadenceName'

export type GetCorrespondingPlanAtCadencePairProps<T extends Plan> = {
    availablePlans: T[]
    currentPlan?: T
    subscriptionPlan?: T
    contractCadence: Cadence
    invoiceCadence: InvoiceCadence
}

function getCadencePairCode(
    contractCadence: Cadence,
    invoiceCadence: InvoiceCadence,
): string {
    if ((contractCadence as string) === (invoiceCadence as string)) {
        return getCadenceName(contractCadence).toLowerCase()
    }
    return `${getCadenceName(contractCadence).toLowerCase()}-invoiced_${getInvoiceCadenceName(invoiceCadence).toLowerCase()}`
}

export function getCorrespondingPlanAtCadencePair<T extends Plan>({
    availablePlans,
    currentPlan,
    subscriptionPlan,
    contractCadence,
    invoiceCadence,
}: GetCorrespondingPlanAtCadencePairProps<T>): T | undefined {
    if (
        subscriptionPlan &&
        subscriptionPlan.cadence === contractCadence &&
        subscriptionPlan.invoice_cadence === invoiceCadence
    ) {
        return subscriptionPlan
    }

    const fallback = availablePlans.find(
        (p) =>
            p.cadence === contractCadence &&
            p.invoice_cadence === invoiceCadence,
    )

    if (!currentPlan) return fallback

    const currentCode = getCadencePairCode(
        currentPlan.cadence,
        currentPlan.invoice_cadence,
    )
    const targetCode = getCadencePairCode(contractCadence, invoiceCadence)
    const targetPlanId = currentPlan.plan_id.replace(currentCode, targetCode)

    if (currentPlan.plan_id === targetPlanId) return fallback

    const exactMatch = availablePlans.find((p) => p.plan_id === targetPlanId)
    if (exactMatch) return exactMatch

    const targetPlanIdWithoutGeneration = targetPlanId.replace(
        /-usd-\d+(?:-\d+)?$/,
        '',
    )
    if (targetPlanIdWithoutGeneration !== targetPlanId) {
        const variantMatch = targetPlanId.match(/-usd-\d+-(\d+)$/)
        const variant = variantMatch?.[1]

        const generationFallback = availablePlans.find((p) => {
            if (!p.plan_id.startsWith(`${targetPlanIdWithoutGeneration}-usd-`))
                return false
            if (variant) {
                if (variant === '1') {
                    return (
                        new RegExp(`-usd-\\d+$`).test(p.plan_id) ||
                        new RegExp(`-usd-\\d+-1$`).test(p.plan_id)
                    )
                }
                return new RegExp(`-usd-\\d+-${variant}$`).test(p.plan_id)
            }
            return true
        })
        if (generationFallback) return generationFallback
    }

    return fallback
}
