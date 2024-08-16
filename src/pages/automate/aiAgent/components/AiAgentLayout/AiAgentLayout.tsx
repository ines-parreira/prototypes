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
    isLoading?: boolean
}

export const AiAgentLayout = ({
    shopName,
    className,
    children,
    title,
    isLoading,
}: Props) => {
    const {headerNavbarItems} = useAiAgentNavigation({shopName})

    return (
        <AutomateView
            isLoading={isLoading}
            title={title ?? AI_AGENT}
            headerNavbarItems={headerNavbarItems}
            className={classnames(css.container, className)}
        >
            {children}
        </AutomateView>
    )
}
