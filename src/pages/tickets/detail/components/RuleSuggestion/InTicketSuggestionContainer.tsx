import classNames from 'classnames'
import React from 'react'

import Avatar from 'pages/common/components/Avatar/Avatar'
import {assetsUrl} from 'utils'

import css from './InTicketSuggestionContainer.less'

type Props = {
    children?: React.ReactNode
    isAIAgent?: boolean
}

export default function InTicketSuggestionContainer({
    children,
    isAIAgent = false,
}: Props) {
    return (
        <div
            className={classNames(css.container, {
                [css.aiAgentContainer]: isAIAgent,
            })}
        >
            <div className={css.avatar}>
                <Avatar
                    isAIAgent={isAIAgent}
                    name={isAIAgent ? 'AI Agent' : 'Gorgias Tips'}
                    size={36}
                    url={assetsUrl('/img/icons/gorgias-icon-logo-white.png')}
                />
            </div>
            {children}
        </div>
    )
}
