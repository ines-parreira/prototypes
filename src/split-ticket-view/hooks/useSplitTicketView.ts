import {useContext} from 'react'

import Context from '../Context'

export default function useSplitTicketView() {
    const ctx = useContext(Context)
    if (ctx === null) {
        throw new Error(
            '`useSplitTicketView` may not be used outside of a SplitTicketViewProvider'
        )
    }

    return ctx
}
