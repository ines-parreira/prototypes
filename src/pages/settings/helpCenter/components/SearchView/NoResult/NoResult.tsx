import classNames from 'classnames'
import React, {FC} from 'react'

import css from './NoResult.less'

export const NoResult: FC<{searchInput: string}> = ({searchInput}) => (
    <div className={css.wrapper}>
        <div className={css.circle}>
            <i className={classNames('material-icons', css.icon)}>article</i>
        </div>
        <p className={css.text}>No results matching ”{searchInput}”</p>
    </div>
)
