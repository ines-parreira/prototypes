import React, {useMemo, useState} from 'react'
import Button from 'pages/common/components/button/Button'

import CopyButton from 'Infobar/features/Field/components/CopyButton'
import {testIds} from 'pages/convert/campaigns/components/CampaignPreview/components/DiscountOfferPreview/utils'
import {CampaignDiscountOffer} from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import {getContrastColor} from 'gorgias-design-system/utils'
import css from './DiscountOfferPreview.less'

const DEFAULT_COLOR = '#0097ff'

export type DiscountOfferPreviewProps = {
    offer: CampaignDiscountOffer
    mainColor?: string
}

export const DiscountOfferPreview: React.FC<DiscountOfferPreviewProps> = ({
    offer,
    mainColor,
}) => {
    const [revealed, setRevealed] = useState(false)

    const buttonStyle = useMemo(() => {
        const color = mainColor || DEFAULT_COLOR
        return {
            backgroundColor: color,
            borderColor: color,
            color: getContrastColor(color),
        }
    }, [mainColor])

    // Generate a random fake suffix to show how a potential revealed code can look like
    const fakeDiscountCode =
        offer.prefix +
        '-' +
        Math.random().toString(36).slice(2, 8).toUpperCase()

    return revealed ? (
        <div
            className={css.revealedWrapper}
            data-testid={testIds.revealedWrapper}
        >
            <Button intent="secondary" className={css.revealedButton}>
                {fakeDiscountCode}
                <CopyButton value={fakeDiscountCode} />
            </Button>
            <span className={css.validityMessage}>Valid for 48 hours</span>
        </div>
    ) : (
        <Button
            intent="primary"
            data-testid={testIds.revealBtn}
            className={css.revealButton}
            onClick={() => setRevealed(true)}
            style={buttonStyle}
        >
            Reveal Your Unique Code
        </Button>
    )
}
