import { Fragment } from 'react'

import { PRICING_DETAILS_URL } from '@repo/billing'

import {
    Box,
    Button,
    Card,
    Heading,
    Link,
    Separator,
    Text,
} from '@gorgias/axiom'
import { InvoiceCadence } from '@gorgias/helpdesk-types'

import type {
    CurrentPlans,
    InternalProductCatalogPlans,
    PlanId,
    ProductType,
} from 'models/billing/types'
import { Cadence, PRODUCT_TO_PLAN_KEY } from 'models/billing/types'
import { getCadenceName, getInvoiceCadenceName } from 'models/billing/utils'
import { ProductRow } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/InternalSelectPlans/ProductRow'
import type { ResolvedPlan } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/useInternalPlanEditor'

const CONTRACT_CADENCES = [Cadence.Month, Cadence.Year] as const

const INVOICE_CADENCES = Object.values(InvoiceCadence)

export type InternalSelectPlansProps = {
    currentPlans: CurrentPlans
    catalogPlans: InternalProductCatalogPlans | undefined
    targetPlans: Partial<Record<ProductType, PlanId>>
    resolvedPlans: ResolvedPlan[]
    contractCadence: Cadence
    invoiceCadence: InvoiceCadence
    onPlanSelect: (productType: ProductType, planId: PlanId) => void
    onContractCadenceChange: (cadence: Cadence) => void
    onInvoiceCadenceChange: (invoiceCadence: InvoiceCadence) => void
}

export function InternalSelectPlans({
    currentPlans,
    catalogPlans,
    targetPlans,
    resolvedPlans,
    contractCadence,
    invoiceCadence,
    onPlanSelect,
    onContractCadenceChange,
    onInvoiceCadenceChange,
}: InternalSelectPlansProps) {
    return (
        <Card
            elevation="default"
            flexDirection="column"
            gap="md"
            flexGrow={1}
            flexBasis={0}
            padding={0}
        >
            <Box flexDirection="column" gap="sm" padding="md" paddingBottom={0}>
                <Heading size="xl">Billing Frequency</Heading>
                <Box flexDirection="column" gap="xs">
                    <Text variant="bold" size="sm">
                        Contract cadence
                    </Text>
                    <Box
                        role="radiogroup"
                        aria-label="Contract cadence"
                        gap="xs"
                    >
                        {CONTRACT_CADENCES.map((cadence) => (
                            <Button
                                key={cadence}
                                role="radio"
                                aria-checked={contractCadence === cadence}
                                variant={
                                    contractCadence === cadence
                                        ? 'secondary'
                                        : 'tertiary'
                                }
                                size="sm"
                                onClick={() => onContractCadenceChange(cadence)}
                            >
                                {getCadenceName(cadence)}
                            </Button>
                        ))}
                    </Box>
                </Box>
                {contractCadence === Cadence.Year && (
                    <Box flexDirection="column" gap="xs">
                        <Text variant="bold" size="sm">
                            Invoice cadence
                        </Text>
                        <Box
                            role="radiogroup"
                            aria-label="Invoice cadence"
                            gap="xs"
                        >
                            {INVOICE_CADENCES.map((ic) => (
                                <Button
                                    key={ic}
                                    role="radio"
                                    aria-checked={invoiceCadence === ic}
                                    variant={
                                        invoiceCadence === ic
                                            ? 'secondary'
                                            : 'tertiary'
                                    }
                                    size="sm"
                                    onClick={() => onInvoiceCadenceChange(ic)}
                                >
                                    {getInvoiceCadenceName(ic)}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
            <Separator />
            <Box
                padding="md"
                paddingBottom={0}
                justifyContent="space-between"
                alignItems="center"
            >
                <Heading size="xl">Select Plans</Heading>
                <Link
                    href={PRICING_DETAILS_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    trailingSlot="external-link"
                    size="sm"
                >
                    See Plans Details
                </Link>
            </Box>
            <Separator />
            <Box
                flexDirection="column"
                paddingBottom="lg"
                paddingTop="xs"
                paddingLeft="md"
                paddingRight="md"
                gap="lg"
            >
                {resolvedPlans.map(({ productType, action, status }, index) => {
                    const currentPlan =
                        currentPlans[PRODUCT_TO_PLAN_KEY[productType]]
                    const isProductActive =
                        status !== 'removed' &&
                        (currentPlan !== null || status === 'added')
                    return (
                        <Fragment key={productType}>
                            <ProductRow
                                productType={productType}
                                plan={currentPlan}
                                catalogPlans={catalogPlans?.[productType]}
                                selectedPlanId={
                                    targetPlans[productType] ??
                                    currentPlan?.plan_id
                                }
                                onPlanSelect={onPlanSelect}
                                isProductActive={isProductActive}
                                actionLabel={action?.label}
                                onAction={action?.onAction}
                            />
                            {index < resolvedPlans.length - 1 && (
                                <Separator variant="dashed" />
                            )}
                        </Fragment>
                    )
                })}
            </Box>
        </Card>
    )
}
