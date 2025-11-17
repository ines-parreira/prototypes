import React from 'react'

import { Link } from 'react-router-dom'

import { Text } from '@gorgias/axiom'
import type { JourneyTypeEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES_MAP_TO_URL } from 'AIJourney/constants'

import css from './CampaignName.less'

export default function CampaignName({
    name,
    storeName,
    journeyType,
    journeyId,
}: {
    name: string
    storeName: string
    journeyType: JourneyTypeEnum
    journeyId: string
}) {
    return (
        <Link
            to={`/app/ai-journey/${storeName}/${JOURNEY_TYPES_MAP_TO_URL[journeyType]}/setup/${journeyId}`}
            className={css.campaignNameLink}
        >
            <Text variant="bold">{name}</Text>
        </Link>
    )
}
