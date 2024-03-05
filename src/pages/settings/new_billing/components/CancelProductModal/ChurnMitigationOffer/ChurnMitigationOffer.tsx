import React from 'react'
import {Reason, ReasonsToCanduContent} from '../types'
import css from './ChurnMitigationOffer.less'

type ChurnMitigationOfferProps = {
    reasonsToCanduContent: ReasonsToCanduContent[]
    primaryReason: Reason
    secondaryReason: Reason | null
}

const ChurnMitigationOffer = ({
    reasonsToCanduContent,
    primaryReason,
    secondaryReason,
}: ChurnMitigationOfferProps) => {
    const canduContentID =
        reasonsToCanduContent.find(
            (reasonToCanduContent) =>
                reasonToCanduContent.primaryReasonLabel ===
                    primaryReason.label &&
                reasonToCanduContent.secondaryReasonLabel ===
                    secondaryReason?.label
        )?.canduContentID || null

    return (
        <div>
            {canduContentID ? (
                <div data-candu-id={canduContentID}></div>
            ) : (
                <div className={css.container}>
                    <span>Need help staying with us?</span>
                    <span>
                        Reach out to{' '}
                        <a href="mailto:support@gorgias.com">
                            support@gorgias.com
                        </a>{' '}
                        for a personalized churn mitigation offer!
                        <br />
                        We're here to make sure you get the most out of your
                        experience with us. Let's work together to keep you
                        happy and satisfied.
                    </span>
                </div>
            )}
        </div>
    )
}

export default ChurnMitigationOffer
