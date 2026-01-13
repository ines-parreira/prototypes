import type { ReactNode } from 'react'

import type { AiAgentScopes } from 'pages/aiAgent/Onboarding_V2/types'

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
