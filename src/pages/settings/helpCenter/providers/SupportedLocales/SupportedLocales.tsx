import React from 'react'
import _keyBy from 'lodash/keyBy'

import {HelpCenterLocale} from '../../../../../models/helpCenter/types'

import {useHelpcenterApi} from '../../hooks/useHelpcenterApi'

const LocaleContext = React.createContext<LocalesByKey>({})

export type LocalesByKey = {
    [key: string]: HelpCenterLocale
}

type Props = {
    children: React.ReactNode
}

export const SupportedLocalesProvider = ({children}: Props): JSX.Element => {
    const [locales, setLocales] = React.useState<LocalesByKey>({})
    const [isLoading, setLoading] = React.useState(true)
    const {isReady, client} = useHelpcenterApi()

    React.useEffect(() => {
        async function init() {
            if (Object.keys(locales).length > 0) {
                return
            }
            if (isReady && client) {
                const response = await client.listLocales()
                setLocales(_keyBy(response.data, 'code'))
                setLoading(false)
            }
        }

        void init()
    }, [isReady])

    if (isLoading) {
        return <div />
    }

    return (
        <LocaleContext.Provider value={locales}>
            {children}
        </LocaleContext.Provider>
    )
}

export const useSupportedLocales = (): LocalesByKey => {
    return React.useContext(LocaleContext)
}
