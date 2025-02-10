import cn from 'classnames'
import React from 'react'

import {Card, CardContent} from 'pages/aiAgent/Onboarding/components/Card'
import {AiAgentScopes} from 'pages/aiAgent/Onboarding/types'

import css from './Goals.less'
import {GoalData} from './types'

type Props = {
    goal: GoalData
    isSelected: boolean
    onSelect: (scope: AiAgentScopes[]) => void
}

const Goal: React.FC<Props> = ({goal, isSelected, onSelect}) => {
    return (
        <Card
            className={cn({[css.selected]: isSelected})}
            onClick={() => onSelect(goal.scope)}
        >
            <CardContent>
                <div className={css.goalContainer}>
                    <div className={css.iconContainer}>
                        <div className={css.icon}>{goal.image}</div>
                    </div>
                    <div className={css.overview}>
                        <h3 className={css.goalName}>{goal.title}</h3>
                        <p className={css.goalDescription}>
                            {goal.description}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default Goal
