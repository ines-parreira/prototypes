import React from 'react'

import CursorClickIcon from './icons/CursorClickIcon'
import RocketIcon from './icons/RocketIcon'
import StarIcon from './icons/StarIcon'

import {GoalType, GoalData} from './types'

export const GoalOption: GoalData[] = [
    {
        type: GoalType.AutomateSupport,
        image: <StarIcon />,
        title: 'Automate support with AI',
        description: 'Simplify customer support with AI-powered responses.',
        subDescription: 'Resolve 1,000 support requests in seconds',
    },
    {
        type: GoalType.BoostSales,
        image: <CursorClickIcon />,
        title: 'Boost Sales with a Personal Shopping Assistant',
        description: 'Increase your sales with a tailored shopping experience.',
        subDescription: 'Resolve 1,000 support requests in seconds',
    },
    {
        type: GoalType.Both,
        image: <RocketIcon />,
        title: 'Do both: Automate Support and Boost Sales',
        description: 'Use our duo AI Agents to handle common customer queries.',
        subDescription: 'Resolve 1,000 support requests in seconds',
    },
]
