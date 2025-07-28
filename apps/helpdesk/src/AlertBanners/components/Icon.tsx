import cn from 'classnames'

import { AlertBannerTypes } from '../types'

import css from './Icon.less'

export const Icon = ({ type, id }: { type: AlertBannerTypes; id?: string }) => (
    <span className={cn('material-icons-round', css.Icon, css[type])} id={id}>
        {type === AlertBannerTypes.Critical && 'error'}
        {type === AlertBannerTypes.Warning && 'warning'}
        {type === AlertBannerTypes.Info && 'info'}
    </span>
)
