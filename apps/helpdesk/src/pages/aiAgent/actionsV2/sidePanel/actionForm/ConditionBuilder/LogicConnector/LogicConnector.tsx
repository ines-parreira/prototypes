import type { LogicOperator } from '../types'

import css from './LogicConnector.less'

type Props = {
    operator: Exclude<LogicOperator, 'none'>
}

export const LogicConnector = ({ operator }: Props) => (
    <div className={css.connector} aria-hidden="true">
        <span className={css.label}>{operator === 'all' ? 'AND' : 'OR'}</span>
    </div>
)
