import React from 'react'
import {ActionApps} from '../types'
import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import css from './TemplateActionBanner.less'

type Props = {
    name: string
    description: string
    app: ActionApps
}

export default function TemplateActionBanner({description, name, app}: Props) {
    const appImageUrl = useGetAppImageUrl(app)

    return (
        <div className={css.container}>
            <div>
                {!appImageUrl ? (
                    <div className={css.appIcon}></div>
                ) : (
                    <img
                        className={css.appIcon}
                        src={appImageUrl}
                        alt={app.type}
                    />
                )}
            </div>
            <div className={css.information}>
                <h3>{name}</h3>
                <p>{description}</p>
            </div>
        </div>
    )
}
