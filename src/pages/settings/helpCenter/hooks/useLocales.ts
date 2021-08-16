import React from 'react'

import {HelpCenterLocale} from '../../../../models/helpCenter/types'

import {useHelpcenterApi} from './useHelpcenterApi'

let cachedLocales: HelpCenterLocale[] = []

export const useLocales = (): HelpCenterLocale[] => {
    const {client} = useHelpcenterApi()
    const [locales, setLocales] = React.useState<HelpCenterLocale[]>(
        cachedLocales
    )

    React.useEffect(() => {
        if (client && locales.length === 0) {
            void client.listLocales().then((response) => {
                setLocales(response.data)
                cachedLocales = response.data
            })
        }
    }, [client])

    return locales
}
