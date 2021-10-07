import React, {FunctionComponent} from 'react'

import previewLight from '../../../../../../img/help-center/preview-light.svg'
import previewDark from '../../../../../../img/help-center/preview-dark.svg'

import {PreviewRadioButton} from '../../../../common/components/PreviewRadioButton'
import ColorField from '../../../../common/forms/ColorField.js'

import {HelpCenterThemes} from '../../types'

import css from './ThemeSwitch.less'

type ThemeSwitchProps = {
    selectedTheme: HelpCenterThemes
    currentColor: string
    onThemeChange: (theme: HelpCenterThemes) => void
    onColorChange: (color: string) => void
}

export const ThemeSwitch: FunctionComponent<ThemeSwitchProps> = ({
    selectedTheme,
    currentColor,
    onThemeChange,
    onColorChange,
}: ThemeSwitchProps) => {
    return (
        <>
            <h4>Theme</h4>
            <p>
                Select which theme you prefer to use in your Help Center.
                <strong> This will affect the header & footer.</strong>
            </p>
            <div className={css.list}>
                <PreviewRadioButton
                    isSelected={selectedTheme === HelpCenterThemes.LIGHT}
                    preview={<img src={previewLight} alt="preview-light" />}
                    title="Light Theme"
                    onClick={() => onThemeChange(HelpCenterThemes.LIGHT)}
                />
                <PreviewRadioButton
                    isSelected={selectedTheme === HelpCenterThemes.DARK}
                    preview={<img src={previewDark} alt="preview-dark" />}
                    title="Dark Theme"
                    onClick={() => onThemeChange(HelpCenterThemes.DARK)}
                />
            </div>

            <ColorField
                label="Primary Color"
                help="This will be used as your primary color in hyperlinks, pagination and icons."
                value={currentColor}
                onChange={onColorChange}
            />
        </>
    )
}
