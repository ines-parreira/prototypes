import cn from 'classnames'

import { Card, CardContent } from 'pages/aiAgent/Onboarding/components/Card'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'

import { GoalData } from './types'

import css from './Goals.less'

type Props = {
    goal: GoalData
    isSelected: boolean
    onSelect: (scope: AiAgentScopes[]) => void
    isHidden?: boolean
}

const Goal: React.FC<Props> = ({ goal, isSelected, onSelect, isHidden }) => {
    return (
        <Card
            className={cn({ [css.selected]: isSelected })}
            onClick={() => onSelect(goal.scope)}
            style={isHidden ? { display: 'none' } : {}}
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
