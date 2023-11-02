import {createContext} from 'react'

type WidgetListContextType = {
    currentListIndex: number | null
}

export default createContext<WidgetListContextType>({
    currentListIndex: null,
})
