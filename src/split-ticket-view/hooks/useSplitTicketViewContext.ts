import {usePersistedState} from 'common/hooks'

export default function useSplitTicketViewContext() {
    return usePersistedState('split-ticket-view-enabled', true)
}
