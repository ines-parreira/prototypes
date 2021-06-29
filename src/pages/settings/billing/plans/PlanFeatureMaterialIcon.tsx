import React from 'react'
import classNames from 'classnames'

import css from './PlanFeatureMaterialIcon.less'

type Props = {
    icon: string
}

export default function PlanFeatureMaterialIcon({icon}: Props) {
    return <i className={classNames(css.icon, 'material-icons')}>{icon}</i>
}
