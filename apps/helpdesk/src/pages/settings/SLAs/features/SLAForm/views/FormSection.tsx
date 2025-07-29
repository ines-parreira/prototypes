import React, { ReactNode } from 'react'

import classNames from 'classnames'

import settingsCss from 'pages/settings/settings.less'

import css from './FormSection.less'

type FormSectionProps = {
    title?: string
    description?: ReactNode | string
    children?: ReactNode
    icon?: ReactNode | string
    headingSize?: 'small' | 'medium' | 'large'
    iconClassName?: string
    className?: string
}

export default function FormSection({
    title,
    description,
    children,
    headingSize,
    icon,
    iconClassName,
    className,
}: FormSectionProps) {
    return (
        <div className={classNames(settingsCss.mb48, className)}>
            {(!!title || !!description) && (
                <>
                    <div className={css.headingWithIcon}>
                        {!!icon && typeof icon === 'string' && (
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.materialIcon,
                                    iconClassName,
                                )}
                            >
                                {icon}
                            </i>
                        )}
                        {!!icon && typeof icon !== 'string' && (
                            <span className={iconClassName}>{icon}</span>
                        )}
                        {!!title && (
                            <h2
                                className={classNames(
                                    settingsCss.headingSection,
                                    settingsCss.mb4,
                                    {
                                        [css.headingSizeS]:
                                            headingSize === 'small',
                                        [css.headingSizeM]:
                                            headingSize === 'medium',
                                        [css.headingSizeL]:
                                            headingSize === 'large',
                                    },
                                )}
                            >
                                {title}
                            </h2>
                        )}
                    </div>
                    {!!description && (
                        <div
                            className={classNames(
                                css.description,
                                css.infoText,
                                settingsCss.mb24,
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
