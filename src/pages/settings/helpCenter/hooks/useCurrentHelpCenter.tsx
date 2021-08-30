import {useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {useSelector} from 'react-redux'

import {helpCentersFetched} from '../../../../state/entities/helpCenters/actions'
import {
    changeViewLanguage,
    getCurrentHelpCenterId,
} from '../../../../state/helpCenter/ui'
import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {HelpCenter} from '../../../../models/helpCenter/types'

import {useHelpcenterApi} from './useHelpcenterApi'

type useCurrentHelpCenterApi = {
    isLoading: boolean
    data: HelpCenter | null
    error: Error | undefined
}

//    We make us of this to not trigger more than 1 request
// if the hook is called multiple times before we have the data.
let fetchInProgress = false

export const useCurrentHelpCenter = (): useCurrentHelpCenterApi => {
    const dispatch = useAppDispatch()
    const currentHelpCenterId = useSelector(getCurrentHelpCenterId)
    const cachedHelpCenter = useSelector(getCurrentHelpCenter)

    const [data, setData] = useState<HelpCenter | null>(cachedHelpCenter)

    const {client} = useHelpcenterApi()

    const [helpCenter, getHelpCenter] = useAsyncFn(async () => {
        if (client && currentHelpCenterId) {
            fetchInProgress = true
            const response = await client.getHelpCenter({
                help_center_id: currentHelpCenterId,
            })
            fetchInProgress = false
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
            }
        }

        if (data?.id !== currentHelpCenterId && !fetchInProgress) {
            void init()
        }
    }, [data, currentHelpCenterId, dispatch, getHelpCenter])

    return {
        isLoading: helpCenter.loading,
        data,
        error: helpCenter.error,
    }
}
