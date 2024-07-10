import {createContext} from 'react'
import {TemplateCustomization} from 'Infobar/features/Template/types'

export const CustomizationContext = createContext<TemplateCustomization | null>(
    null
)
