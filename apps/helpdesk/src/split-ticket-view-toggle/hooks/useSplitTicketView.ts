import { useContext } from 'react'

import { DefaultExportContext as Context } from '../Context'

export function useSplitTicketView() {
    const ctx = useContext(Context)
    if (ctx === null) {
        throw new Error(
            '`useSplitTicketView` may not be used outside of a SplitTicketViewProvider',
        )
    }

    return ctx
}
