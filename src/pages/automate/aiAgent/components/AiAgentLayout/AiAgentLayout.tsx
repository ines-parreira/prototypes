import React, {ReactNode} from 'react'
import classnames from 'classnames'
import AutomateView from 'pages/automate/common/components/AutomateView'
import {AI_AGENT} from 'pages/automate/common/components/constants'
import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
import css from './AiAgentLayout.less'

type Props = {
    children: ReactNode
    shopName: string
    className?: string
    title?: ReactNode
}

export const AiAgentLayout = ({
    shopName,
    className,
    children,
    title,
}: Props) => {
    const {headerNavbarItems} = useAiAgentNavigation({shopName})

    return (
        <AutomateView
            title={title ?? AI_AGENT}
            headerNavbarItems={headerNavbarItems}
            className={classnames(css.container, className)}
        >
            {children}
        </AutomateView>
    )
}
