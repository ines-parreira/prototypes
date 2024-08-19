import {createContext, RefObject} from 'react'

export interface Item {
    id?: number
    name?: string
    [key: string]: any
}

type ContextState = {
    data: Item[]
    isLoading?: boolean
    onClick?: (item: Item | null, isNew?: boolean) => void
    search?: string
    setSearch?: (s: string) => void
    debouncedSearch?: string
    wrapperRef?: RefObject<HTMLDivElement>
}

export default createContext<ContextState>({
    data: [],
})
