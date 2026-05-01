import React from 'react'

import { Link, useParams } from 'react-router-dom'

import { Text } from '@gorgias/axiom'
import type { JourneyTypeEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES_MAP_TO_URL } from 'AIJourney/constants'

import css from './JourneyName.less'

type JourneyNameProps = {
    name: string
    journeyType: JourneyTypeEnum
    journeyId?: string
}

export const JourneyName = ({
    name,
    journeyType,
    journeyId,
}: JourneyNameProps) => {
    const { shopName } = useParams<{ shopName: string }>()
    return (
        <Link
            to={`/app/ai-journey/${shopName}/${JOURNEY_TYPES_MAP_TO_URL[journeyType]}/setup${journeyId ? `/${journeyId}` : ''}`}
        >
            <Text variant="bold" className={css.journeyNameLink}>
                {name}
            </Text>
        </Link>
    )
}
