import css from './OpportunitiesEmptyState.less'

export const OpportunitiesEmptyState = () => {
    return (
        <div className={css.containerContent}>
            <div className={css.emptyState}>
                <h3 className={css.title}>No opportunities yet</h3>
                <p className={css.description}>
                    AI Agent will start finding opportunities to improve as
                    <br />
                    it learns from conversations with your customers
                </p>
            </div>
        </div>
    )
}
