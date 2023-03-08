import {useContext} from 'react'
import {ContactForm} from 'models/contactForm/types'
import {CurrentContactFormContext} from '../contexts/currentContactForm.context'

export const useCurrentContactForm = (): ContactForm => {
    const contactForm = useContext(CurrentContactFormContext)

    if (!contactForm) {
        throw new Error(
            `${useCurrentContactForm.name} should be used inside the <CurrentContactFormContext/>`
        )
    }

    return contactForm
}
