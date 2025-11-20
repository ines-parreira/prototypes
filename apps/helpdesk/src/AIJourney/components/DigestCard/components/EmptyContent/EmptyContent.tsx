import css from './EmptyContent.less'

export const EmptyContent = () => {
    return (
        <div className={css.container}>
            <i
                style={{ fontWeight: 600, marginBottom: '4px' }}
                className="material-icons-outlined"
            >
                show_chart
            </i>
            <span className={css.noData}>No data available yet</span>
            <span className={css.info}>
                The AI Journey will start showing data once it has been active
                for a while.
            </span>
        </div>
    )
}
