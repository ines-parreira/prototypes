import React from 'react'

import _get from 'lodash/get'
import {Theme, Themes, useSavedTheme} from 'theme'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import css from 'pages/settings/yourProfile/components/ThemeList.less'

type Props = {
    savedTheme: ReturnType<typeof useSavedTheme>
    onChangeTheme: (theme: ReturnType<typeof useSavedTheme>) => void
}

export default function ThemeList({savedTheme, onChangeTheme}: Props) {
    return (
        <div className={css.themeListWrapper}>
            {Object.entries(Themes).map(([themeValue, themeSpecs]) => {
                return (
                    <PreviewRadioButton
                        label={
                            <ButtonIconLabel
                                icon={themeSpecs.icon}
                                iconClassName={
                                    savedTheme === themeValue
                                        ? css.buttonIconWrapperSelected
                                        : css.buttonIconWrapper
                                }
                            >
                                {_get(themeSpecs, 'settingsLabel') ||
                                    themeSpecs.label}
                            </ButtonIconLabel>
                        }
                        key={themeValue}
                        value={themeValue}
                        className={css.previewRadioButtonWrapper}
                        onClick={() => {
                            onChangeTheme(themeValue as Theme)
                        }}
                        isSelected={savedTheme === themeValue}
                        hidden
                    />
                )
            })}
        </div>
    )
}
