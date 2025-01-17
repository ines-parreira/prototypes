import {ReactNode} from 'react'

export enum GoalType {
    AutomateSupport = 'automateSupport',
    BoostSales = 'boostSales',
    Both = 'both',
}

export type GoalData = {
    type: GoalType
    title: string
    image: ReactNode
    description: string
    subDescription: string
}
