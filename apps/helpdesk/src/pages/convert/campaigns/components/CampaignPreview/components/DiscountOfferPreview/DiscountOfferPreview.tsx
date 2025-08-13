import React, { useMemo, useState } from 'react'

import { Button } from '@gorgias/axiom'

import CopyButton from 'components/CopyButton/CopyButton'
import { getContrastColor } from 'gorgias-design-system/utils'
import { CampaignDiscountOffer } from 'pages/convert/campaigns/types/CampaignDiscountOffer'

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
    const [isRevealed, setIsRevealed] = useState(false)

    const buttonStyle = useMemo(() => {
        const color = mainColor || DEFAULT_COLOR
        return {
            backgroundColor: color,
            borderColor: color,
            color: getContrastColor(color),
        }
    }, [mainColor])

    // Generate a random fake suffix to show how a potential revealed code can look like
    const fakeDiscountCode = useMemo(
        () =>
            offer.prefix +
            '-' +
            Math.random().toString(36).slice(2, 8).toUpperCase(),
        [offer.prefix],
    )

    return isRevealed ? (
        <div className={css.revealedWrapper}>
            <Button
                intent="secondary"
                aria-label="Copy discount code"
                className={css.revealedButton}
            >
                {fakeDiscountCode}
                <CopyButton value={fakeDiscountCode} />
            </Button>
            <span className={css.validityMessage}>Valid for 48 hours</span>
        </div>
    ) : (
        <Button
            intent="primary"
            className={css.revealButton}
            onClick={() => setIsRevealed(true)}
            style={buttonStyle}
        >
            Reveal Your Unique Code
        </Button>
    )
}
