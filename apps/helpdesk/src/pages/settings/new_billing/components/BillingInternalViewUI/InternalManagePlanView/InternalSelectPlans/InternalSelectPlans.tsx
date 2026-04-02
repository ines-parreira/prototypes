import { Fragment } from 'react'

import { PRICING_DETAILS_URL } from '@repo/billing'

import { Box, Card, Heading, Link, Separator } from '@gorgias/axiom'

import type {
    CurrentPlans,
    InternalProductCatalogPlans,
    PlanId,
    ProductType,
} from 'models/billing/types'
import { PRODUCT_TO_PLAN_KEY } from 'models/billing/types'
import { ProductRow } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/InternalSelectPlans/ProductRow'
import type { ResolvedPlan } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/useInternalPlanEditor'

type InternalSelectPlansProps = {
    currentPlans: CurrentPlans
    catalogPlans: InternalProductCatalogPlans | undefined
    targetPlans: Partial<Record<ProductType, PlanId>>
    resolvedPlans: ResolvedPlan[]
    onPlanSelect: (productType: ProductType, planId: PlanId) => void
}

export function InternalSelectPlans({
    currentPlans,
    catalogPlans,
    targetPlans,
    resolvedPlans,
    onPlanSelect,
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
                        status !== 'removed' && action?.kind !== 'add'
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
