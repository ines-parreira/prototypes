import { useContext } from 'react'

import { DefaultExportCurrentHelpCenterContext as CurrentHelpCenterContext } from '../contexts/CurrentHelpCenterContext'

export function useCurrentHelpCenter() {
    const helpCenter = useContext(CurrentHelpCenterContext)

    if (!helpCenter) {
        throw new Error(
            `useCurrentHelpCenter should be used inside the CurrentHelpCenterContext provider`,
        )
    }

    return helpCenter
}
