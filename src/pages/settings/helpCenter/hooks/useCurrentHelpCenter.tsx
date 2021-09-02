import {useEffect} from 'react'

import {useAsyncFn} from 'react-use'
import {useSelector} from 'react-redux'

import {helpCentersFetched} from '../../../../state/entities/helpCenters/actions'
import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'
import {getCurrentHelpCenterId} from '../../../../state/helpCenter/ui'

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
    const {client} = useHelpcenterApi()

    const localeHelpCenterId = useSelector(getCurrentHelpCenterId)
    const localHelpCenter = useSelector(getCurrentHelpCenter)

    const [helpCenter, getHelpCenter] = useAsyncFn(async () => {
        if (client && localeHelpCenterId) {
            fetchInProgress = true
            const response = await client.getHelpCenter({
                help_center_id: localeHelpCenterId,
            })
            fetchInProgress = false
            return response.data
        }
    }, [client, localeHelpCenterId])

    // ? Ensure we have the current help center loaded in store
    useEffect(() => {
        async function requestHelpCenter() {
            const response = await getHelpCenter()
            if (response) {
                dispatch(helpCentersFetched([response]))
            }
        }

        if (!localHelpCenter && !fetchInProgress) {
            void requestHelpCenter()
        }
    }, [localeHelpCenterId, localHelpCenter, dispatch, getHelpCenter])

    return {
        isLoading: helpCenter.loading,
        data: localHelpCenter,
        error: helpCenter.error,
    }
}
