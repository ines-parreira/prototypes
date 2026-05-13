import moment from 'moment'

import { Banner, Box, Text } from '@gorgias/axiom'

import { getPlanUnitsPerCadence, getProductName } from 'models/billing/utils'
import useScheduledChangesNotifications from 'pages/settings/new_billing/hooks/useScheduledChangesNotifications'

export default function BillingScheduledUpdates() {
    const { error, loading, scheduledUpdates } =
        useScheduledChangesNotifications()

    if (loading) return null

    if (error) {
        return (
            <Banner icon="triangle-warning" intent="destructive">
                Something went wrong while trying to fetch scheduled downgrades.
            </Banner>
        )
    }

    if (!scheduledUpdates) return null

    if (scheduledUpdates) {
        return (
            <>
                {scheduledUpdates.map((billingUpdate) =>
                    billingUpdate.targetPlan ? (
                        <div
                            className="mb-4"
                            key={billingUpdate.currentPlan.product}
                        >
                            <Banner variant="inline">
                                <Box
                                    flexWrap="wrap"
                                    columnGap="xxs"
                                    alignItems="center"
                                    paddingBottom="xxs"
                                >
                                    <Text>Your plan change for</Text>
                                    <Text variant="bold">
                                        {getProductName(
                                            billingUpdate.currentPlan.product,
                                        )}
                                    </Text>
                                    <Text>
                                        to{' '}
                                        {getPlanUnitsPerCadence(
                                            billingUpdate.targetPlan,
                                        )}
                                    </Text>
                                    <Text>
                                        will take effect at the end of your
                                        billing cycle, on
                                    </Text>
                                    <Text variant="bold">
                                        {moment(billingUpdate.datetime).format(
                                            'MMMM Do YYYY',
                                        )}
                                        .
                                    </Text>
                                </Box>
                            </Banner>
                        </div>
                    ) : (
                        <div
                            className="mb-4"
                            key={billingUpdate.currentPlan.product}
                        >
                            <Banner key={billingUpdate.currentPlan.product}>
                                <Box
                                    flexWrap="wrap"
                                    columnGap="xxs"
                                    alignItems="center"
                                    paddingBottom="xxs"
                                >
                                    <Text>Your subscription to </Text>
                                    <Text variant="bold">
                                        {' '}
                                        {getProductName(
                                            billingUpdate.currentPlan.product,
                                        )}{' '}
                                    </Text>
                                    <Text>
                                        will end at the end of your billing
                                        cycle on{' '}
                                    </Text>
                                    <Text variant="bold">
                                        {moment(billingUpdate.datetime).format(
                                            'MMMM Do YYYY',
                                        )}
                                    </Text>
                                    .
                                </Box>
                            </Banner>
                        </div>
                    ),
                )}
            </>
        )
    }
}
