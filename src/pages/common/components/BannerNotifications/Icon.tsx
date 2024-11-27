import cn from 'classnames'
import React from 'react'

import css from './Icon.less'
import {AlertBannerTypes} from './types'

export const Icon = ({type}: {type: AlertBannerTypes}) => (
    <span className={cn('material-icons-round', css.Icon, css[type])}>
        {type === AlertBannerTypes.Critical && 'error'}
        {type === AlertBannerTypes.Warning && 'warning'}
        {type === AlertBannerTypes.Info && 'info'}
    </span>
)
