import {
    TicketQAScoreDimension,
    TicketQAScoreDimensionName,
} from '@gorgias/api-queries'
import cn from 'classnames'
import React from 'react'

import css from './config.less'
import type {DimensionConfig} from './types'

export const dimensionOrder: SupportedTicketQADimensionName[] = [
    TicketQAScoreDimensionName.ResolutionCompleteness,
    TicketQAScoreDimensionName.CommunicationSkills,
]

export type SupportedTicketQADimensionName =
    | typeof TicketQAScoreDimensionName.ResolutionCompleteness
    | typeof TicketQAScoreDimensionName.CommunicationSkills

export type SupportedTicketQAScoreDimension = Exclude<
    TicketQAScoreDimension,
    'name'
> & {
    name: SupportedTicketQADimensionName
}

export const dimensionConfig: Record<
    SupportedTicketQADimensionName,
    DimensionConfig
> = {
    [TicketQAScoreDimensionName.CommunicationSkills]: {
        autoExpandThreshold: 4,
        label: 'Communication',
        options: [1, 2, 3, 4, 5].map((i) => ({label: `${i}/5`, value: i})),
        prefix: <i className={cn('material-icons-round', css.icon)}>star</i>,
        tooltip:
            'On a scale of 1 to 5, 5 being best, did the agent demonstrate empathy, clarity of messaging, patience, positivity, and adaptability?',
    },
    [TicketQAScoreDimensionName.ResolutionCompleteness]: {
        autoExpandThreshold: 0,
        label: 'Resolution',
        options: [
            {label: 'Incomplete', value: 0},
            {label: 'Complete', value: 1},
        ],
        tooltip: 'Did the agent address ALL issues brought up by the customer?',
    },
}
