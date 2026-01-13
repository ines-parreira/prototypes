import type { TopElement } from 'pages/aiAgent/Onboarding_V2/components/TopElementsCard/types'

import css from './TopElementItem.less'

type Props = {
    topElement: TopElement
}

const TopElementItem = ({ topElement }: Props) => {
    const percentage = topElement.percentage ?? 0
    const percentageWidth = `${Math.max(1, Math.min(350, (percentage * 350) / 100))}px`

    return (
        <div className={css.item}>
            <div className={css.title}>{topElement.title}</div>
            <div className={css.progress}>
                <div
                    style={{ width: percentageWidth }}
                    className={css.bar}
                ></div>
                <div className={css.percentage}>{percentage}%</div>
            </div>
        </div>
    )
}

export default TopElementItem
