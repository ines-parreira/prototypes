import React, {useMemo} from 'react'
import moment from 'moment-timezone'
import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import {ProductType} from 'models/billing/types'
import {
    getCheapestSMSPrice,
    getCurrentSMSProduct,
    getCheapestVoicePrice,
    getCurrentVoiceProduct,
} from 'state/billing/selectors'
import {getCurrentSubscription} from 'state/currentAccount/selectors'

import AutomationCard from './add-ons/automation/AutomationCard'
import AddOnCard from './add-ons/AddOnCard'
import BillingHeader from './common/BillingHeader'

import css from './AddOns.less'

const AddOns = () => {
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const voiceProduct = useAppSelector(getCurrentVoiceProduct)
    const smsProduct = useAppSelector(getCurrentSMSProduct)
    const cheapestVoicePrice = useAppSelector(getCheapestVoicePrice)
    const cheapestSMSPrice = useAppSelector(getCheapestSMSPrice)
    const areSmsVoiceAddOnsEnabled = useMemo(
        () => moment().diff(moment('2023-01-02'), 'minutes') >= 0,
        []
    )

    const hasSubscription = useMemo(
        () => !currentSubscription.isEmpty(),
        [currentSubscription]
    )

    return (
        <div className={css.wrapper}>
            <BillingHeader icon="add_box">Add-ons</BillingHeader>
            <div className={css.addOns}>
                {hasSubscription && (
                    <AutomationCard
                        className={classnames(css.card, {
                            [css['automation-card']]: !areSmsVoiceAddOnsEnabled,
                        })}
                    />
                )}
                {areSmsVoiceAddOnsEnabled && (
                    <>
                        <AddOnCard
                            name={ProductType.Voice}
                            addOnPrice={voiceProduct}
                            className={css.card}
                            nonSubscriberDescription={
                                <>
                                    <b>Provide hands-free phone support</b>{' '}
                                    right from the helpdesk.
                                </>
                            }
                            pricingDetailsLink="https://docs.gorgias.com/en-US/billing-and-subscriptions-81852#voice-tickets"
                            headerPriceAmount={cheapestVoicePrice?.amount}
                        />
                        <AddOnCard
                            name={ProductType.SMS}
                            addOnPrice={smsProduct}
                            className={css.card}
                            nonSubscriberDescription={
                                <>
                                    <b>Deliver fast, conversational support</b>{' '}
                                    to customers on the go.
                                </>
                            }
                            pricingDetailsLink="https://docs.gorgias.com/en-US/billing-and-subscriptions-81852#sms-tickets"
                            headerPriceAmount={cheapestSMSPrice?.amount}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export default AddOns
