import React from 'react'

import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'

import {useNavBar} from '../hooks/useNavBar/useNavBar'
import css from './NavBarButtonTooltip.less'

export function NavBarButtonTooltip() {
    const {isNavBarVisible} = useNavBar()
    return (
        <div className={css.tooltipContent}>
            {isNavBarVisible ? 'Collapse' : 'Expand'}
            <ShortcutIcon type="dark">[</ShortcutIcon>
        </div>
    )
}
