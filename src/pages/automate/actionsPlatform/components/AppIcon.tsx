import React from 'react'

import css from './AppIcon.less'

type Props = {
    icon?: string
    name?: string
}

const AppIcon = ({ icon, name }: Props) => {
    return <img src={icon} alt={name} className={css.container} title={name} />
}

export default AppIcon
