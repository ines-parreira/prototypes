import React from 'react'

import css from './AiAgentOverviewLayout.less'

type Props = {
    children: React.ReactNode
}
export const AiAgentOverviewLayout = ({ children }: Props) => {
    return (
        <div className={css.container} data-overflow="visible">
            {children}
        </div>
    )
}
