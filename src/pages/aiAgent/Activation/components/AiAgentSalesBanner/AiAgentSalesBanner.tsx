import classNames from 'classnames'

import { AIButton } from 'pages/common/components/AIButton/AIButton'

import css from './AiAgentSalesBanner.less'

type Props = {
    onClick: () => void
    className?: string
}
export const AiAgentSalesBanner = ({ onClick, className }: Props) => {
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
            <AIButton onClick={onClick}>Learn More</AIButton>
        </div>
    )
}
