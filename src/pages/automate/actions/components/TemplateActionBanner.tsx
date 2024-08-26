import React from 'react'
import {ActionAppConfiguration} from '../types'
import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import css from './TemplateActionBanner.less'

type Props = {
    name: string
    description?: string | null
    canduId?: string
    actionAppConfiguration: ActionAppConfiguration
}

export default function TemplateActionBanner({
    description,
    name,
    canduId,
    actionAppConfiguration,
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
            </div>
        </div>
    )
}
