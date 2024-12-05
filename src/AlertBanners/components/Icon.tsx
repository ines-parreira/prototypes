import cn from 'classnames'
import React from 'react'

import {AlertBannerTypes} from '../types'
import css from './Icon.less'

export const Icon = ({type}: {type: AlertBannerTypes}) => (
    <span className={cn('material-icons-round', css.Icon, css[type])}>
        {type === AlertBannerTypes.Critical && 'error'}
        {type === AlertBannerTypes.Warning && 'warning'}
        {type === AlertBannerTypes.Info && 'info'}
    </span>
)
