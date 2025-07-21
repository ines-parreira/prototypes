import { ReactNode } from 'react'

import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'

export enum GoalType {
    AutomateSupport = 'automateSupport',
    BoostSales = 'boostSales',
    Both = 'both',
}

export type GoalData = {
    type: GoalType
    scope: AiAgentScopes[]
    title: string
    image: ReactNode
    description: string
    isHidden?: boolean
}
