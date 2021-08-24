import {useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {useSelector} from 'react-redux'

import {helpCentersFetched} from '../../../../state/entities/helpCenters/actions'
import {
    changeViewLanguage,
    getCurrentHelpCenterId,
} from '../../../../state/helpCenter/ui'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {HelpCenter} from '../../../../models/helpCenter/types'

import {useHelpcenterApi} from './useHelpcenterApi'

type useCurrentHelpCenterApi = {
    isLoading: boolean
    data: HelpCenter | null
    error: Error | undefined
}

let cachedHelpCenter: HelpCenter

export const useCurrentHelpCenter = (): useCurrentHelpCenterApi => {
    const dispatch = useAppDispatch()
    const currentHelpCenterId = useSelector(getCurrentHelpCenterId)
    const [data, setData] = useState<HelpCenter>(cachedHelpCenter)

    const {client} = useHelpcenterApi()

    const [helpCenter, getHelpCenter] = useAsyncFn(async () => {
        if (client && currentHelpCenterId) {
            const response = await client.getHelpCenter({
                help_center_id: currentHelpCenterId,
            })

            return response.data
        }
    }, [client, currentHelpCenterId])

    useEffect(() => {
        async function init() {
            const response = await getHelpCenter()

            if (response) {
                dispatch(helpCentersFetched([response]))
                dispatch(changeViewLanguage(response.default_locale))

                setData(response)
                cachedHelpCenter = response
            }
        }

        if (data?.id !== currentHelpCenterId) {
            void init()
        }
    }, [data, currentHelpCenterId, dispatch, getHelpCenter])

    return {
        isLoading: helpCenter.loading,
        data,
        error: helpCenter.error,
    }
}
