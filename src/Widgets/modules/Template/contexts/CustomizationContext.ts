import {createContext} from 'react'
import {TemplateCustomization} from 'Widgets/modules/Template/types'

export const CustomizationContext = createContext<TemplateCustomization | null>(
    null
)
