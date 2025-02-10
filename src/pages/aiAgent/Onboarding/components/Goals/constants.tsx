import React from 'react'

import {AiAgentScopes} from 'pages/aiAgent/Onboarding/types'

import CursorClickIcon from './icons/CursorClickIcon'
import RocketIcon from './icons/RocketIcon'
import StarIcon from './icons/StarIcon'

import {GoalType, GoalData} from './types'

export const GoalOption: GoalData[] = [
    {
        type: GoalType.AutomateSupport,
        scope: [AiAgentScopes.SUPPORT],
        image: <StarIcon />,
        title: 'Automate support with AI',
        description: 'Simplify customer support with AI-powered responses.',
    },
    {
        type: GoalType.BoostSales,
        scope: [AiAgentScopes.SALES],
        image: <CursorClickIcon />,
        title: 'Boost Sales with a Personal Shopping Assistant',
        description: 'Increase your sales with a tailored shopping experience.',
    },
    {
        type: GoalType.Both,
        scope: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
        image: <RocketIcon />,
        title: 'Do both: Automate Support and Boost Sales',
        description: 'Use our duo AI Agents to handle common customer queries.',
    },
]
