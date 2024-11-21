import _get from 'lodash/get'
import React from 'react'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import css from 'pages/settings/yourProfile/components/ThemeList.less'
import {ThemeType, THEMES} from 'theme'

type Props = {
    savedTheme: ThemeType
    onChangeTheme: (theme: ThemeType) => void
}

export default function ThemeList({savedTheme, onChangeTheme}: Props) {
    return (
        <div className={css.themeListWrapper}>
            {Object.entries(THEMES).map(([themeValue, themeSpecs]) => {
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
                            onChangeTheme(themeValue as ThemeType)
                        }}
                        isSelected={savedTheme === themeValue}
                        hidden
                    />
                )
            })}
        </div>
    )
}
