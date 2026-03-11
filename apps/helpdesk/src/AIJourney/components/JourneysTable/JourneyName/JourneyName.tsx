import React from 'react'

import { Link } from 'react-router-dom'

import { Text } from '@gorgias/axiom'
import type { JourneyTypeEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES_MAP_TO_URL } from 'AIJourney/constants'

import css from './JourneyName.less'

type JourneyNameProps = {
    name: string
    storeName: string
    journeyType: JourneyTypeEnum
    journeyId?: string
}

export const JourneyName = ({
    name,
    storeName,
    journeyType,
    journeyId,
}: JourneyNameProps) => {
    return (
        <Link
            to={`/app/ai-journey/${storeName}/${JOURNEY_TYPES_MAP_TO_URL[journeyType]}/setup${journeyId ? `/${journeyId}` : ''}`}
        >
            <Text variant="bold" className={css.journeyNameLink}>
                {name}
            </Text>
        </Link>
    )
}
