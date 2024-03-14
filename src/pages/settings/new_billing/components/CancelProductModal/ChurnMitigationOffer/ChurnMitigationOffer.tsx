import React from 'react'
import css from './ChurnMitigationOffer.less'

type ChurnMitigationOfferProps = {
    canduContentId: string | null
}

const ChurnMitigationOffer = ({canduContentId}: ChurnMitigationOfferProps) => {
    return (
        <div>
            {canduContentId ? (
                <div data-candu-id={canduContentId}></div>
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
