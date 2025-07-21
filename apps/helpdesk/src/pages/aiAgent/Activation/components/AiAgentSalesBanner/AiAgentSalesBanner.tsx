import classNames from 'classnames'

import { AIButton } from 'pages/common/components/AIButton/AIButton'

import css from './AiAgentSalesBanner.less'

type AiAgentSalesBannerProps = {
    onClick: () => void
    className?: string
    canStartTrial?: boolean
    isLoading?: boolean
}
export const AiAgentSalesBanner = ({
    onClick,
    className,
    canStartTrial,
    isLoading,
}: AiAgentSalesBannerProps) => {
    if (isLoading) {
        return null
    }

    return (
        <div className={classNames(css.container, className)}>
            <i className={classNames('material-icons', css.icon)}>
                auto_awesome
            </i>
            <div>
                <div className={css.title}>
                    Upgrade AI Agent with Sales Skills
                </div>
                <div className={css.description}>
                    Increase your chat conversation rate and maximize revenue
                    opportunities.
                </div>
            </div>
            <AIButton onClick={onClick}>
                {canStartTrial ? 'Start Trial' : 'Learn More'}
            </AIButton>
        </div>
    )
}
