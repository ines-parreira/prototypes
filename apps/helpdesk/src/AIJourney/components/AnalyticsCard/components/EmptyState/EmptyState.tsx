import cartIcon from 'assets/img/ai-journey/cart.svg'

import css from './EmptyState.less'

export const EmptyState = () => {
    return (
        <div className={css.container}>
            <img src={cartIcon} alt="sphere-icon" />

            <span className={css.noData}>No data available yet</span>
            <span className={css.info}>
                Your Abandoned Cart has not collected any data yet.
            </span>
        </div>
    )
}
