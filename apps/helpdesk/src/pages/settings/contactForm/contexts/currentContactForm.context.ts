import { createContext } from 'react'

import { ContactForm } from 'models/contactForm/types'

export const CurrentContactFormContext = createContext<ContactForm | null>(null)
