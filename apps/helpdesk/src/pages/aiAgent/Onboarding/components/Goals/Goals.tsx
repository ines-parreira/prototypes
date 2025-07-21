import isEqual from 'lodash/isEqual'

import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'

import { GoalOption } from './constants'
import Goal from './Goal'

import css from './Goals.less'

type Props = {
    value: AiAgentScopes[]
    onSelect: (value: AiAgentScopes[]) => void
}

const Goals: React.FC<Props> = ({ value, onSelect }) => {
    return (
        <div className={css.goalsContainer}>
            {GoalOption.map((goal) => {
                return (
                    <Goal
                        key={goal.type}
                        goal={goal}
                        isSelected={isEqual(goal.scope, value)}
                        onSelect={onSelect}
                        isHidden={goal.isHidden}
                    />
                )
            })}
        </div>
    )
}

export default Goals
