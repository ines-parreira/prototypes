import React from 'react'

import css from '../../RuleRecipeModal.less'

type Props = {
    count: number
}

const TargetCount: React.FC<Props> = ({count}) => (
    <div className={css.count}>
        <div className={css.targetTitle}>install to target up to</div>
        <div className={css.targetValue}>
            <span className={css.bold}>{count}</span>{' '}
            <span className={css.ticketsPerMonth}>tickets/month</span>
        </div>
    </div>
)

export default TargetCount
