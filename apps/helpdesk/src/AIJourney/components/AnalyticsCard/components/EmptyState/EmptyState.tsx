import css from './EmptyState.less'

export const EmptyState = ({ journeyType }: { journeyType?: string }) => {
    return (
        <div className={css.container}>
            <span className={css.noData}>No data available</span>
            <span className={css.info}>
                {`Your ${journeyType} has not collected any data yet.`}
            </span>
        </div>
    )
}
