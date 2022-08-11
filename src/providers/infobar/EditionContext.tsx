import {createContext} from 'react'

// TODO @Manuel: Once all classes from InfobarWidgets are migrated to functional
// components, remove `editing` and `isEditing` props drilling and enrich this
// context

type EditionContextType = {
    isEditing: boolean
}

export const EditionContext = createContext<EditionContextType>({
    isEditing: false,
})
