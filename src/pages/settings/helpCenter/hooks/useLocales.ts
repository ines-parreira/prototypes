import {useEffect, useState} from 'react'

import {Locale} from '../../../../models/helpCenter/types'

import {useHelpCenterApi} from './useHelpCenterApi'

let cachedLocales: Locale[] = []

export const useLocales = (): Locale[] => {
    const {client} = useHelpCenterApi()
    const [locales, setLocales] = useState<Locale[]>(cachedLocales)

    useEffect(() => {
        if (client && locales.length === 0) {
            void client.listLocales().then((response) => {
                setLocales(response.data)
                cachedLocales = response.data
            })
        }
    }, [client, locales])

    return locales
}
