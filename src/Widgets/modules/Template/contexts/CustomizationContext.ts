import { createContext } from 'react'

import { TemplateCustomization } from '../types'

export const CustomizationContext = createContext<TemplateCustomization | null>(
    null,
)
