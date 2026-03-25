import type {
    Cadence,
    CancellationDates,
    PlansByProduct,
    SelectedPlans,
} from '@repo/billing'
import { ProductType } from '@repo/billing'

import { Box, Text } from '@gorgias/axiom'

import { SummaryItem } from '../SummaryItem'
import SummaryTotal from '../SummaryTotal'

type BillingSummaryBreakdownProps = {
    selectedPlans: SelectedPlans
    cadence: Cadence
    plansByProduct: PlansByProduct
    totalProductAmount: number
    totalCancelledAmount: number
    cancelledProducts: ProductType[]
    currency: string
    cancellationDates?: CancellationDates
}

export function BillingSummaryBreakdown({
    selectedPlans,
    cadence,
    plansByProduct,
    totalProductAmount,
    totalCancelledAmount,
    cancelledProducts,
    currency,
    cancellationDates = {},
}: BillingSummaryBreakdownProps) {
    return (
        <>
            <Box
                justifyContent="space-between"
                alignItems="center"
                marginBottom="md"
            >
                <Text color="content-neutral-tertiary" size="sm" variant="bold">
                    PRODUCT
                </Text>
                <Text color="content-neutral-tertiary" size="sm" variant="bold">
                    PRICE
                </Text>
            </Box>
            {Object.values(ProductType).map((productType) => (
                <SummaryItem
                    key={productType}
                    productType={productType}
                    cadence={cadence}
                    currentPlan={plansByProduct[productType].current}
                    availablePlans={plansByProduct[productType].available}
                    selectedPlans={selectedPlans}
                    scheduledToCancelAt={cancellationDates[productType]}
                />
            ))}
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                totalCancelledAmount={totalCancelledAmount}
                cancelledProducts={cancelledProducts}
                cadence={cadence}
                currency={currency}
            />
        </>
    )
}
