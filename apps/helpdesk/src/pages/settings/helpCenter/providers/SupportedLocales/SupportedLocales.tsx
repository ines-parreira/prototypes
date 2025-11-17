import type { ReactNode } from 'react'
import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import type { Locale } from '../../../../../models/helpCenter/types'
import { useHelpCenterApi } from '../../hooks/useHelpCenterApi'

const SupportedLocalesContext = createContext<Locale[] | null>(null)

type Props = {
    children: ReactNode
}

export const SupportedLocalesProvider: React.FC<Props> = ({ children }) => {
    const { client } = useHelpCenterApi()
    const [locales, setLocales] = useState<Locale[]>([])

    useEffect(() => {
        async function init() {
            if (client && locales.length === 0) {
                const response = await client.listLocales()

                const localesResponse = response.data

                const sortedLocales = localesResponse.sort((a, b) =>
                    a.name.localeCompare(b.name),
                )

                setLocales(sortedLocales)
            }
        }

        void init()
    }, [client, locales])

    return (
        <SupportedLocalesContext.Provider value={locales}>
            {children}
        </SupportedLocalesContext.Provider>
    )
}

export const useSupportedLocales = () => {
    const locales = useContext(SupportedLocalesContext)

    if (!locales) {
        throw new Error(
            `useSupportedLocales should be used inside the SupportedLocalesContext provider`,
        )
    }

    return locales
}
