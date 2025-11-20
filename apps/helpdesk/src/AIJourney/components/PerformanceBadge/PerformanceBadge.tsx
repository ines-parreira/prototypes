import sphereIcon from 'assets/img/ai-journey/sphere.svg'

import css from './PerformanceBadge.less'

export const PerformanceBadge = ({ content }: { content: string }) => {
    return (
        <div className={css.performanceBadge}>
            <img src={sphereIcon} alt="sphere-icon" />
            <div className={css.badge}>
                <span>{content}</span>
            </div>
        </div>
    )
}
