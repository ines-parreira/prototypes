import { createContext } from 'react'

type WidgetListContextType = {
    currentListIndex: number | null
}

const DefaultExportWidgetListContext = createContext<WidgetListContextType>({
    currentListIndex: null,
})

export { DefaultExportWidgetListContext }
