import React from 'react'

import {THEME_CONFIGS} from 'core/theme'
import type {HelpdeskThemeName} from 'core/theme'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import css from 'pages/settings/yourProfile/components/ThemeList.less'

type Props = {
    savedTheme: HelpdeskThemeName
    onChangeTheme: (theme: HelpdeskThemeName) => void
}

export default function ThemeList({savedTheme, onChangeTheme}: Props) {
    return (
        <div className={css.themeListWrapper}>
            {THEME_CONFIGS.map((themeConfig) => {
                return (
                    <PreviewRadioButton
                        label={
                            <ButtonIconLabel
                                icon={themeConfig.icon}
                                iconClassName={
                                    savedTheme === themeConfig.name
                                        ? css.buttonIconWrapperSelected
                                        : css.buttonIconWrapper
                                }
                            >
                                {themeConfig.settingsLabel || themeConfig.label}
                            </ButtonIconLabel>
                        }
                        key={themeConfig.name}
                        value={themeConfig.name}
                        className={css.previewRadioButtonWrapper}
                        onClick={() => {
                            onChangeTheme(themeConfig.name)
                        }}
                        isSelected={savedTheme === themeConfig.name}
                        hidden
                    />
                )
            })}
        </div>
    )
}
