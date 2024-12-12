import {useEffect, useState} from 'react'

import {getLDClient} from 'utils/launchDarkly'

export default function useLaunchDarklyClient() {
    const [isLdInitialized, setIsLdInitialized] = useState(false)
    const [ldClient, setLdClient] = useState<ReturnType<
        typeof getLDClient
    > | null>(null)

    useEffect(() => {
        const launchDarklyClient = getLDClient()
        if (launchDarklyClient) {
            void launchDarklyClient.waitForInitialization().then(() => {
                setLdClient(launchDarklyClient)
                setIsLdInitialized(true)
            })
        }
    }, [])

    return {ldClient, isLdInitialized}
}
