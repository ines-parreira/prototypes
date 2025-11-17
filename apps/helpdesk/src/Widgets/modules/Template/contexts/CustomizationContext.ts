import { createContext } from 'react'

import type { TemplateCustomization } from '../types'

export const CustomizationContext = createContext<TemplateCustomization | null>(
    null,
)
