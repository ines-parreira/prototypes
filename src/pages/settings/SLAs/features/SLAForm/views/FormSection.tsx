import React, {ReactNode} from 'react'
import classNames from 'classnames'

import settingsCss from 'pages/settings/settings.less'

import css from './FormSection.less'

type FormSectionProps = {
    title?: string
    description?: ReactNode | string
    children: ReactNode
    headingSize?: 's' | 'm' | 'l'
}

export default function FormSection({
    title,
    description,
    children,
    headingSize,
}: FormSectionProps) {
    return (
        <div className={settingsCss.mb48}>
            {(!!title || !!description) && (
                <>
                    {!!title && (
                        <h2
                            className={classNames(
                                settingsCss.headingSection,
                                settingsCss.mb4,
                                {
                                    [css.headingSizeS]: headingSize === 's',
                                    [css.headingSizeM]: headingSize === 'm',
                                    [css.headingSizeL]: headingSize === 'l',
                                }
                            )}
                        >
                            {title}
                        </h2>
                    )}
                    {!!description && (
                        <div
                            className={classNames(
                                css.infoText,
                                settingsCss.mb24
                            )}
                        >
                            {description}
                        </div>
                    )}
                </>
            )}
            {children}
        </div>
    )
}
