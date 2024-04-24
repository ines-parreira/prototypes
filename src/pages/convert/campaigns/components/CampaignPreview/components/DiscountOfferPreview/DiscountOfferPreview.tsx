import React, {useState} from 'react'
import Button from 'pages/common/components/button/Button'

import CopyButton from 'Infobar/features/Field/components/CopyButton'
import {testIds} from 'pages/convert/campaigns/components/CampaignPreview/components/DiscountOfferPreview/utils'
import {CampaignDiscountOffer} from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import css from './DiscountOfferPreview.less'

export type DiscountOfferPreviewProps = {
    offer: CampaignDiscountOffer
}

export const DiscountOfferPreview: React.FC<DiscountOfferPreviewProps> = ({
    offer,
}) => {
    const [revealed, setRevealed] = useState(false)

    return revealed ? (
        <div
            className={css.revealedWrapper}
            data-testid={testIds.revealedWrapper}
        >
            <Button intent="secondary">
                {offer.prefix}
                <CopyButton value={offer.prefix} />
            </Button>
            <span className={css.validityMessage}>Valid for 48 hours</span>
        </div>
    ) : (
        <Button
            intent="primary"
            data-testid={testIds.revealBtn}
            className={css.revealButton}
            onClick={() => setRevealed(true)}
        >
            Reveal Your Unique Code
        </Button>
    )
}
