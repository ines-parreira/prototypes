import React from 'react'

import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'

import {NavBarDisplayMode} from '../hooks/useNavBar/context'
import {useNavBar} from '../hooks/useNavBar/useNavBar'
import css from './NavBarButtonTooltip.less'

export function NavBarButtonTooltip() {
    const {navBarDisplay} = useNavBar()
    return (
        <div className={css.tooltipContent}>
            {navBarDisplay === NavBarDisplayMode.Open ? 'Collapse' : 'Expand'}
            <ShortcutIcon type="dark">[</ShortcutIcon>
        </div>
    )
}
