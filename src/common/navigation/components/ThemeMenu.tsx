import cn from 'classnames'
import React, {useCallback} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {THEME_CONFIGS, useSetTheme, useTheme} from 'core/theme'
import type {HelpdeskThemeName} from 'core/theme'

import css from './UserMenu.less'

export default function ThemeMenu() {
    const setTheme = useSetTheme()
    const theme = useTheme()

    const updateTheme = useCallback(
        (name: HelpdeskThemeName) => {
            setTheme(name)
            logEvent(SegmentEvent.ThemeUpdate, {
                theme: name,
            })
        },
        [setTheme]
    )

    return (
        <>
            {THEME_CONFIGS.map(({label, name}) => (
                <button
                    key={name}
                    className={cn(css['dropdown-item-user-menu'], css.justify)}
                    onClick={() => updateTheme(name)}
                >
                    {label}
                    {theme.name === name && (
                        <span className={cn(css.check, 'material-icons')}>
                            done
                        </span>
                    )}
                </button>
            ))}
        </>
    )
}
