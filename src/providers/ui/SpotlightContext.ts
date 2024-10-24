import _noop from 'lodash/noop'
import {createContext, Dispatch, SetStateAction} from 'react'

export type SpotlightContextType = {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

export const SpotlightContext = createContext<SpotlightContextType>({
    isOpen: false,
    setIsOpen: _noop,
})
