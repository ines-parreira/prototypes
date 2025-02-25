import { useCallback, useMemo, useState } from 'react'

import client from 'models/api/resources'

export default function useAuthentication() {
    const [{ userToken, apiKey }, setAuthentication] = useState({
        apiKey: window.KNOCK_PUBLIC_KEY,
        userToken: window.KNOCK_TOKEN,
    })

    const refreshToken = useCallback(async () => {
        const res = await client.get<{ knock_token: string }>(
            '/third-party/auth',
        )
        const { knock_token } = res.data

        setAuthentication((prevState) => ({
            ...prevState,
            userToken: knock_token,
        }))
    }, [])

    return useMemo(
        () => ({
            apiKey,
            userToken,
            refreshToken,
        }),
        [apiKey, userToken, refreshToken],
    )
}
