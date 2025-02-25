import React from 'react'

import css from './ChurnMitigationOffer.less'

type ChurnMitigationOfferProps = {
    canduContentId: string | null
}

const ChurnMitigationOffer = ({
    canduContentId,
}: ChurnMitigationOfferProps) => {
    return (
        <div>
            {canduContentId ? (
                <div data-candu-id={canduContentId}></div>
            ) : (
                <div className={css.container}>
                    <span>Need help staying with us?</span>
                    <span>
                        {`If you would like to get help with the product, discuss
                        potential offers, or share further feedback, please
                        select “Accept Offer” below. Let's work together to keep
                        you happy and satisfied.`}
                    </span>
                </div>
            )}
        </div>
    )
}

export default ChurnMitigationOffer
