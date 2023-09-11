import {useEffect} from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import {useListTicketVoiceCalls} from 'models/voiceCall/queries'
import {updateQueryTimestamp} from 'state/queries/actions'
import {QueryKey} from 'state/queries/types'
import useAppSelector from 'hooks/useAppSelector'
import {getTicketState} from 'state/ticket/selectors'

export default function useTicketVoiceCalls() {
    const ticket = useAppSelector(getTicketState)
    const ticketId = ticket.get('id')
    const voiceCalls = useListTicketVoiceCalls({ticket_id: ticketId})

    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(updateQueryTimestamp(QueryKey.TicketVoiceCalls))
    }, [voiceCalls.data, dispatch])

    return voiceCalls
}
