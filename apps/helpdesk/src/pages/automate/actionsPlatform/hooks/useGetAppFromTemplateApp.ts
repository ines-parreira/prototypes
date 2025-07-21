import { useCallback } from 'react'

import { ActionTemplateApp, App } from '../types'

export type GetAppFromTemplateApp = (
    templateApp: ActionTemplateApp,
) => App | undefined

type Props = {
    apps: App[]
}

const useGetAppFromTemplateApp = ({ apps }: Props) => {
    return useCallback<GetAppFromTemplateApp>(
        (templateApp) => {
            switch (templateApp.type) {
                case 'shopify':
                case 'recharge':
                    return apps.find((app) => app.type === templateApp.type)
                case 'app':
                    return apps.find(
                        (app) =>
                            app.type === templateApp.type &&
                            app.id === templateApp.app_id,
                    )
            }
        },
        [apps],
    )
}

export default useGetAppFromTemplateApp
