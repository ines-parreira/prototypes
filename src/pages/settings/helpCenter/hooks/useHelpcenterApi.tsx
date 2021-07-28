import React from 'react'

import {
    getHelpCenterClient,
    HelpCenterClient,
} from '../../../../../../../rest_api/help_center_api/index'

type UseHelpCenterApiInterface = {
    isReady: boolean
    client: HelpCenterClient | undefined
}

let client: HelpCenterClient

export const useHelpcenterApi = (): UseHelpCenterApiInterface => {
    const [isReady, setReady] = React.useState(client !== undefined)

    React.useEffect(() => {
        async function init() {
            setReady(false)
            client = await getHelpCenterClient()
            setReady(true)
        }
        if (client === undefined) {
            void init()
        }
    }, [])

    return {
        isReady,
        client,
    }
}
