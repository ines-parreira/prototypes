import type { ComponentProps } from 'react'

import classNames from 'classnames'

import { THEME_NAME, useTheme } from 'core/theme'
import InputField from 'pages/common/forms/input/InputField'

import css from './TimeInputField.less'

type Props = ComponentProps<typeof InputField>

export default function TimeInputField({ className, ...props }: Props) {
    const theme = useTheme()

    return (
        <InputField
            className={classNames(css.container, className, {
                [css.dark]: theme.resolvedName === THEME_NAME.Dark,
            })}
            type="time"
            pattern="[0-9][0-9]:[0-9][0-9]"
            {...props}
        />
    )
}
