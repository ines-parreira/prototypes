import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {Locale} from '../../../../../models/helpCenter/types'
import {useHelpCenterApi} from '../../hooks/useHelpCenterApi'

const SupportedLocalesContext = createContext<Locale[] | null>(null)

type Props = {
    children: ReactNode
}

export const SupportedLocalesProvider: React.FC<Props> = ({children}) => {
    const {client} = useHelpCenterApi()
    const [locales, setLocales] = useState<Locale[]>([])
    const enableNewLanguages = useFlags()[FeatureFlagKey.EnableNewLanguages]

    useEffect(() => {
        async function init() {
            if (client && locales.length === 0) {
                const response = await client.listLocales()

                let localesResponse = response.data

                if (!enableNewLanguages) {
                    const unsupportedCodes = [
                        'en-GB',
                        'fi-FI',
                        'ja-JP',
                        'pt-BR',
                    ]
                    localesResponse = localesResponse.filter(
                        ({code}) => !unsupportedCodes.includes(code)
                    )
                }

                const sortedLocales = localesResponse.sort((a, b) =>
                    a.name.localeCompare(b.name)
                )

                setLocales(sortedLocales)
            }
        }

        void init()
    }, [client, locales, enableNewLanguages])

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
            `useSupportedLocales should be used inside the SupportedLocalesContext provider`
        )
    }

    return locales
}
