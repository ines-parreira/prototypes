import { useContext } from 'react'

import { DefaultExportAppNodeContext as AppNodeContext } from './AppNodeContext'

export function useAppNode() {
    return useContext(AppNodeContext)
}
