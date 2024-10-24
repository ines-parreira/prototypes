import moment from 'moment'
import React from 'react'

import {getPlanUnitsPerCadence, getProductName} from 'models/billing/utils'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import css from 'pages/settings/new_billing/components/BillingScheduledDowngrades/BillingScheduledDowngrades.less'
import useScheduledDowngrades from 'pages/settings/new_billing/hooks/useScheduledDowngrades'

export default function BillingScheduledDowngrades() {
    const {
        error,
        loading,
        value: scheduledDowngrades,
    } = useScheduledDowngrades()
    if (loading) return null

    if (error) {
        return (
            <Alert icon className={css.downgrade} type={AlertType.Error}>
                Something went wrong while trying to fetch scheduled downgrades.
            </Alert>
        )
    }

    if (!scheduledDowngrades) return null

    return (
        <>
            {scheduledDowngrades.map((downgrade) =>
                downgrade.targetPlan ? (
                    <Alert
                        key={downgrade.currentPlan.product}
                        className={css.downgrade}
                    >
                        Your plan change for{' '}
                        <b>{getProductName(downgrade.currentPlan.product)}</b>{' '}
                        to <b>{getPlanUnitsPerCadence(downgrade.targetPlan)}</b>{' '}
                        will take effect at the end of your billing cycle, on{' '}
                        <b>
                            {moment(downgrade.datetime).format('MMMM Do YYYY')}
                        </b>
                        .
                    </Alert>
                ) : (
                    <Alert
                        key={downgrade.currentPlan.product}
                        className={css.downgrade}
                    >
                        Your subscription to{' '}
                        {getProductName(downgrade.currentPlan.product)} will end
                        at the end of your billing cycle on{' '}
                        {moment(downgrade.datetime).format('MMMM Do YYYY')}.
                    </Alert>
                )
            )}
        </>
    )
}
