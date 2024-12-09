import React, {useMemo} from 'react'

import useApps from 'pages/automate/actionsPlatform/hooks/useApps'

import {ActionAppConfiguration} from '../types'
import css from './UseCaseTemplateConfirmationStep.less'

type Props = {
    app?: ActionAppConfiguration
    name: string
}

export default function UseCaseTemplateConfirmationStep({app, name}: Props) {
    const {apps} = useApps()

    const appName = useMemo(() => {
        return apps.find(({id, type}) =>
            app?.type === 'app'
                ? type === 'app' && id === app.app_id
                : type === app?.type
        )
    }, [app, apps])

    return (
        <div className={css.container}>
            <img src={appName?.icon} alt={appName?.type} />
            {name} in {appName?.name}
        </div>
    )
}
