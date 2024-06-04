import {useContext} from 'react'

import CanduContext from './CanduContext'

export default function useCandu() {
    return useContext(CanduContext)
}
