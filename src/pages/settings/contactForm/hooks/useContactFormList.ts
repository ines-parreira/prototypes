import {useState} from 'react'

type ContactFormListHook = {
    contactForms: any[]
    isLoading: boolean
}

export const useContactFormList = (): ContactFormListHook => {
    const [isLoading] = useState(false)

    return {contactForms: [], isLoading}
}
