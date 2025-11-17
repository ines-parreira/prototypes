import { useCallback } from 'react'

import type { ActionsApp, App } from '../types'

export type GetAppFromActionsApp = (
    actionsApp: Pick<ActionsApp, 'id'>,
) => App | undefined

type Props = {
    apps: App[]
}

const useGetAppFromActionsApp = ({ apps }: Props) => {
    return useCallback<GetAppFromActionsApp>(
        (actionsApp) => {
            return apps.find((app) => app.id === actionsApp.id)
        },
        [apps],
    )
}

export default useGetAppFromActionsApp
