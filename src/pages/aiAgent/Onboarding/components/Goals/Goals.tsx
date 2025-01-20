import React from 'react'

import {AiAgentScopes} from 'pages/aiAgent/Onboarding/types'

import {GoalOption} from './constants'
import Goal from './Goal'
import css from './Goals.less'

type Props = {
    value: AiAgentScopes[]
    onSelect: (value: AiAgentScopes[]) => void
}

const Goals: React.FC<Props> = ({value, onSelect}) => {
    const handleGoalChange = (scope: AiAgentScopes[]) => {
        onSelect(scope)
    }

    const areScopesEqual = (scope1: string[], scope2: string[]): boolean => {
        if (!scope1 || !scope2) return false
        if (scope1.length !== scope2.length) return false
        const sortedScope1 = [...scope1].sort()
        const sortedScope2 = [...scope2].sort()
        return sortedScope1.every(
            (value, index) => value === sortedScope2[index]
        )
    }

    return (
        <div className={css.goalsContainer}>
            {GoalOption.map((goal) => {
                return (
                    <Goal
                        key={goal.type}
                        goal={goal}
                        isSelected={areScopesEqual(goal.scope, value)}
                        onSelect={handleGoalChange}
                    />
                )
            })}
        </div>
    )
}

export default Goals
