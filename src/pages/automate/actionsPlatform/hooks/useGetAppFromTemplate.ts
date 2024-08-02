import {useCallback} from 'react'

import {ActionTemplate, App} from '../types'

export type GetAppFromTemplate = (
    templateApp: ActionTemplate['apps'][number]
) => App | undefined

type Props = {
    apps: App[]
}

const useGetAppFromTemplate = ({apps}: Props) => {
    return useCallback<GetAppFromTemplate>(
        (templateApp) => {
            switch (templateApp.type) {
                case 'shopify':
                case 'recharge':
                    return apps.find((app) => app.type === templateApp.type)
                case 'app':
                    return apps.find(
                        (app) =>
                            app.type === templateApp.type &&
                            app.id === templateApp.app_id
                    )
            }
        },
        [apps]
    )
}

export default useGetAppFromTemplate
