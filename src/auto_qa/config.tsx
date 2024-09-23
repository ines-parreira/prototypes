import cn from 'classnames'
import React from 'react'

import type {Dimension, DimensionConfig} from './types'
import css from './config.less'

export const dimensionOrder: Dimension['name'][] = [
    'resolution',
    'communication_skills',
]

export const dimensionConfig: Record<Dimension['name'], DimensionConfig> = {
    communication_skills: {
        label: 'Communication',
        options: [1, 2, 3, 4, 5].map((i) => ({label: `${i}/5`, value: i})),
        prefix: <i className={cn('material-icons-round', css.icon)}>star</i>,
        tooltip:
            'On a scale of 1 to 5, 5 being best, did the agent demonstrate empathy, clarity of messaging, patience, positivity, and adaptability?',
    },
    resolution: {
        label: 'Resolution',
        options: [
            {label: 'Incomplete', value: 0},
            {label: 'Complete', value: 1},
        ],
        tooltip: 'Did the agent address ALL issues brought up by the customer?',
    },
}
