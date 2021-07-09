import {useEffect, useState} from 'react'
import axios from 'axios'
import {useSelector} from 'react-redux'

import {helpCentersFetched} from '../../../../state/entities/helpCenters/actions'
import {readHelpcenterById} from '../../../../state/entities/helpCenters/selectors'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {HelpCenter} from '../../../../models/helpCenter/types'

import {useHelpcenterApi} from './useHelpcenterApi'

type useCurrentHelpCenterApi = {
    isLoading: boolean
    data: HelpCenter | null
    errorCode: number | undefined
}

type ErrorResponse = {
    statusCode: number
    message: string
}

export const useCurrentHelpCenter = (
    helpcenterId: number
): useCurrentHelpCenterApi => {
    const dispatch = useAppDispatch()
    const data = useSelector(readHelpcenterById(helpcenterId.toString()))

    const {isReady, client} = useHelpcenterApi()

    const [isLoading, setLoading] = useState<boolean>(!data)
    const [errorCode, setErrorCode] = useState<number>()

    useEffect(() => {
        async function init() {
            if (isReady && client) {
                try {
                    const response = await client.getHelpCenter({
                        id: helpcenterId,
                    })

                    dispatch(helpCentersFetched([response.data]))
                    setLoading(false)
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        const data: ErrorResponse = error.response?.data
                        setErrorCode(data.statusCode)
                    }
                    console.error(error)
                }
            }
        }
        if (!data) {
            void init()
        }
    }, [client, data, helpcenterId, isReady])

    return {
        isLoading,
        data,
        errorCode,
    }
}
