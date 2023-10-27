import {useContext} from 'react'

import CurrentHelpCenterContext from '../contexts/CurrentHelpCenterContext'

export default function useCurrentHelpCenter() {
    const helpCenter = useContext(CurrentHelpCenterContext)

    if (!helpCenter) {
        throw new Error(
            `useCurrentHelpCenter should be used inside the CurrentHelpCenterContext provider`
        )
    }

    return helpCenter
}
