import cn from 'classnames'
import React from 'react'

import Badge from 'gorgias-design-system/Badge/Badge'
import {Card, CardContent} from 'pages/aiAgent/Onboarding/components/Card'

import css from './Goals.less'
import {GoalData} from './types'

type Props = {
    goal: GoalData
    isSelected: boolean
    onSelect: (value: string | null) => void
}

const Goal: React.FC<Props> = ({goal, isSelected, onSelect}) => {
    return (
        <Card
            className={cn({[css.selected]: isSelected})}
            onClick={() => onSelect(isSelected ? null : goal.type)}
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
                <div>
                    <Badge
                        color="accessoryGrey"
                        label={goal.subDescription}
                        className={css.badge}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export default Goal
