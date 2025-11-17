import { createContext } from 'react'

import type { ContactForm } from 'models/contactForm/types'

export const CurrentContactFormContext = createContext<ContactForm | null>(null)
