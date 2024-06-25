import React, {ReactNode} from 'react'
import classNames from 'classnames'

import settingsCss from 'pages/settings/settings.less'

import css from './FormSection.less'

type FormSectionProps = {
    title?: string
    description?: string
    children: ReactNode
}

export default function FormSection({
    title,
    description,
    children,
}: FormSectionProps) {
    return (
        <div className={settingsCss.mb48}>
            {(!!title || !!description) && (
                <>
                    {!!title && (
                        <h2
                            className={classNames(
                                settingsCss.headingSection,
                                settingsCss.mb4
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
