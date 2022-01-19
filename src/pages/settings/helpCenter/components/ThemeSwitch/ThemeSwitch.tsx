import React, {FunctionComponent} from 'react'

import previewLight from 'assets/img/help-center/preview-light.svg'
import previewDark from 'assets/img/help-center/preview-dark.svg'

import {PreviewRadioButton} from '../../../../common/components/PreviewRadioButton'
import ColorField from '../../../../common/forms/ColorField.js'

import {HelpCenterTheme} from '../../types'

import css from './ThemeSwitch.less'

type ThemeSwitchProps = {
    selectedTheme: HelpCenterTheme
    currentColor: string
    onThemeChange: (theme: HelpCenterTheme) => void
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
                Select which theme you prefer to use in your help center.&nbsp;
                <b>This will affect the header &amp; footer.</b>
            </p>
            <div className={css.list}>
                <PreviewRadioButton
                    isSelected={selectedTheme === HelpCenterTheme.LIGHT}
                    value={HelpCenterTheme.LIGHT}
                    preview={<img src={previewLight} alt="preview-light" />}
                    label="Light Theme"
                    onClick={() => onThemeChange(HelpCenterTheme.LIGHT)}
                />
                <PreviewRadioButton
                    isSelected={selectedTheme === HelpCenterTheme.DARK}
                    preview={<img src={previewDark} alt="preview-dark" />}
                    label="Dark Theme"
                    value={HelpCenterTheme.DARK}
                    onClick={() => onThemeChange(HelpCenterTheme.DARK)}
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
