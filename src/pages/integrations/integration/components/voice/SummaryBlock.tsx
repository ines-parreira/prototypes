import css from './SummaryBlock.less'

type SummaryBlockProps = {
    summaryData: Record<string, string | number>
    children?: React.ReactNode
}

function SummaryBlock({ summaryData, children }: SummaryBlockProps) {
    return (
        <div className={css.container}>
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
