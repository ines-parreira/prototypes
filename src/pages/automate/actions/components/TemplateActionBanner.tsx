import React from 'react'

import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import {ActionAppConfiguration} from '../types'
import css from './TemplateActionBanner.less'

type Props = {
    name: string
    description?: string | null
    canduId?: string
    actionAppConfiguration: ActionAppConfiguration
    children?: React.ReactNode
}

export default function TemplateActionBanner({
    description,
    name,
    canduId,
    actionAppConfiguration,
    children,
}: Props) {
    const appImageUrl = useGetAppImageUrl(actionAppConfiguration)

    return (
        <div className={css.container} data-candu-id={canduId}>
            <div>
                {!appImageUrl ? (
                    <div className={css.appIcon}></div>
                ) : (
                    <img
                        className={css.appIcon}
                        src={appImageUrl}
                        alt={actionAppConfiguration.type}
                    />
                )}
            </div>
            <div className={css.information}>
                <h3>{name}</h3>
                <p>
                    {description ||
                        'Customize this Action and its conditions to fit your needs.'}
                </p>
                {children}
            </div>
        </div>
    )
}
