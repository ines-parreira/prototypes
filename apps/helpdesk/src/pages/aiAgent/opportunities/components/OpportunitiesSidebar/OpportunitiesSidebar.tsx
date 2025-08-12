import css from './OpportunitiesSidebar.less'

export const OpportunitiesSidebar = () => {
    return (
        <div className={css.sidebar}>
            <div className={css.header}>
                <h3 className={css.title}>Available opportunities</h3>
            </div>
            <div className={css.containerContent}>
                <div className={css.emptyState}>0 items</div>
            </div>
        </div>
    )
}
