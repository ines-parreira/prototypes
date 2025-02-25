import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { LocationDescriptor } from 'history'
import { useHistory } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import {
    DRAFT_TICKET_STORE,
    isTicketDraftEmpty,
    TicketDraft,
} from 'hooks/useTicketDraft'
import LocalForageManager from 'services/localForageManager/localForageManager'
import { getCurrentUser } from 'state/currentUser/selectors'

export default function useHandleTicketDraft() {
    const history = useHistory()
    const currentUser = useAppSelector(getCurrentUser)
    const localForageRef = useRef<LocalForage>()
    if (!localForageRef.current) {
        localForageRef.current = LocalForageManager.getTable(DRAFT_TICKET_STORE)
    }
    const localForage = localForageRef.current
    const [hasDraft, setHasDraft] = useState(false)

    const checkDraft = useCallback(async () => {
        const draft = (await localForage.getItem('new')) as TicketDraft
        setHasDraft(!isTicketDraftEmpty(draft))
    }, [localForage])

    useEffect(() => {
        let subscription: Subscription | undefined
        const setupSubscription = async () => {
            await localForage.ready()
            subscription = LocalForageManager.observeTable(
                DRAFT_TICKET_STORE,
                checkDraft,
            )
        }

        void setupSubscription()

        return () => {
            subscription?.unsubscribe()
        }
    }, [localForage, checkDraft])

    useEffectOnce(() => {
        void checkDraft()
    })

    const onResumeDraft = useCallback(() => {
        history.push('/app/ticket/new')
        logEvent(SegmentEvent.DraftTicket, {
            type: 'resume',
            user_id: currentUser.get('id'),
        })
    }, [currentUser, history])

    const onDiscardDraft = useCallback(
        async (
            params: LocationDescriptor<{
                receiver: {
                    name: string
                    address: string
                }
            }>,
        ) => {
            await localForage.clear()
            history.push(params)
            logEvent(SegmentEvent.DraftTicket, {
                type: 'discard',
                user_id: currentUser.get('id'),
            })
        },
        [currentUser, history, localForage],
    )

    return useMemo(
        () => ({ hasDraft, onResumeDraft, onDiscardDraft }),
        [hasDraft, onResumeDraft, onDiscardDraft],
    )
}
