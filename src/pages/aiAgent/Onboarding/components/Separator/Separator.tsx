import React from 'react'

import css from './Separator.less'

export const Separator: React.FC<{
    size?: string
}> = ({size = 's'}) => <div className={css[`separator-${size}`]}></div>
