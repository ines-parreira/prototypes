import {createContext, Dispatch, SetStateAction} from 'react'
import _noop from 'lodash/noop'

export type SynchronizedScrollTopValue = {
    scrollTop: number
    setScrollTop: Dispatch<SetStateAction<number>>
    scrollHeight: number
    setScrollHeight: Dispatch<SetStateAction<number>>
}

export const defaultSynchronizedScrollTopValue: SynchronizedScrollTopValue = {
    scrollTop: 0,
    scrollHeight: 0,
    setScrollTop: _noop,
    setScrollHeight: _noop,
}

export default createContext<SynchronizedScrollTopValue>(
    defaultSynchronizedScrollTopValue
)
