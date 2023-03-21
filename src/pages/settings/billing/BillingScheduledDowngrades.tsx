import moment from 'moment'
import React from 'react'

import {ProductType} from 'models/billing/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import useScheduledDowngrades from './hooks/useScheduledDowngrades'
import css from './BillingScheduledDowngrades.less'

const productNames: Record<ProductType, string> = {
    [ProductType.Automation]: 'Automation Add-On',
    [ProductType.Helpdesk]: 'Helpdesk',
    [ProductType.SMS]: 'SMS Add-On',
    [ProductType.Voice]: 'Voice Add-On',
}

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
                downgrade.to ? (
                    <Alert key={downgrade.product.id} className={css.downgrade}>
                        Your plan change from{' '}
                        {productNames[downgrade.product.type]}{' '}
                        {downgrade.from.name} to {downgrade.to.name} will take
                        effect at the end of your billing cycle, on{' '}
                        {moment(downgrade.datetime).format('MMMM Do YYYY')}.
                    </Alert>
                ) : (
                    <Alert key={downgrade.product.id} className={css.downgrade}>
                        Your subscription to{' '}
                        {productNames[downgrade.product.type]}{' '}
                        {downgrade.from.name} will end at the end of your
                        billing cycle on{' '}
                        {moment(downgrade.datetime).format('MMMM Do YYYY')}.
                    </Alert>
                )
            )}
        </>
    )
}
