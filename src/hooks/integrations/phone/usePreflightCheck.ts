import {useEffect} from 'react'
import {Device} from '@twilio/voice-sdk'

import {setPreflightCheckStatus} from 'state/twilio/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {PreflightCheckStatus} from 'state/twilio/types'
import {fetchToken} from 'models/phoneNumber/resources'

export function usePreflightCheck() {
    const dispatch = useAppDispatch()
    const {preflightCheckStatus} = useAppSelector((state) => state.twilio)

    async function runCheck(currentStatus: PreflightCheckStatus) {
        if (currentStatus !== PreflightCheckStatus.NotPerformed) {
            return
        }

        dispatch(setPreflightCheckStatus(PreflightCheckStatus.Running))

        const token = await fetchToken()
        if (!token) {
            dispatch(setPreflightCheckStatus(PreflightCheckStatus.Failed))
            return
        }

        const preflightTest = Device.runPreflight(token, {fakeMicInput: true})
        if (!preflightTest) {
            dispatch(setPreflightCheckStatus(PreflightCheckStatus.Failed))
            return
        }

        preflightTest.on('completed', () => {
            dispatch(setPreflightCheckStatus(PreflightCheckStatus.Succeeded))
        })

        preflightTest.on('failed', () => {
            dispatch(setPreflightCheckStatus(PreflightCheckStatus.Failed))
        })
    }

    useEffect(() => {
        void runCheck(preflightCheckStatus)
    }, [preflightCheckStatus])
}
