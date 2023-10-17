import {useContext} from 'react'

import AppNodeContext from './AppNodeContext'

export default function useAppNode() {
    return useContext(AppNodeContext)
}
