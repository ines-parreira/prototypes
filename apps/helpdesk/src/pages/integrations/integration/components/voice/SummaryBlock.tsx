import classNames from 'classnames'

import css from './SummaryBlock.less'

type SummaryBlockProps = {
    summaryData: Record<string, string | number>
    children?: React.ReactNode
    isTransparent?: boolean
}

function SummaryBlock({
    summaryData,
    children,
    isTransparent,
}: SummaryBlockProps) {
    return (
        <div
            className={classNames(css.container, {
                [css.transparent]: isTransparent,
            })}
        >
            <div className={css.details}>
                {Object.entries(summaryData).map(([key, value]) => (
                    <div key={key}>
                        {key}: <span className={css.detail}>{value}</span>
                    </div>
                ))}
            </div>
            {children}
        </div>
    )
}

export default SummaryBlock
