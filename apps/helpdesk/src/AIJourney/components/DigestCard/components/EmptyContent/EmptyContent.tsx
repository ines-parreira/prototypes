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
                Your Abandoned Cart flow has been activated recently. Data will
                soon be available.
            </span>
        </div>
    )
}
