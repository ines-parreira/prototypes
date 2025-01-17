import React from 'react'

import {GoalOption} from './constants'
import Goal from './Goal'
import css from './Goals.less'

type Props = {
    value: string | null
    onSelect: (value: string | null) => void
}

const Goals: React.FC<Props> = ({value, onSelect}) => {
    const handleGoalChange = (goal: string | null) => {
        onSelect(goal)
    }

    return (
        <div className={css.goalsContainer}>
            {GoalOption.map((goal) => (
                <Goal
                    key={goal.type}
                    goal={goal}
                    isSelected={goal.type === value}
                    onSelect={handleGoalChange}
                />
            ))}
        </div>
    )
}

export default Goals
