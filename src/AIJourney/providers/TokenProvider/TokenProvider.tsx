import React, { createContext, useContext, useEffect, useState } from 'react'

import { GorgiasAppAuthService } from 'utils/gorgiasAppsAuth'

const TokenContext = createContext<string | null>(null)

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        const fetchToken = async () => {
            const authService = new GorgiasAppAuthService()
            const accessToken = await authService.getAccessToken()
            setToken(accessToken)
        }
        fetchToken()
    }, [])

    if (!token) return null

    return (
        <TokenContext.Provider value={token}>{children}</TokenContext.Provider>
    )
}

export const useAccessToken = () => useContext(TokenContext)
