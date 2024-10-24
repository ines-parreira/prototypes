import {useParams} from 'react-router-dom'

import {CONTACT_FORM_ID_PARAM} from '../constants'

type ContactFormParseIdResult = {
    isValid: boolean
    id: number
}

export const useContactFormIdParam = (): ContactFormParseIdResult => {
    const params = useParams<{[CONTACT_FORM_ID_PARAM]: string}>()
    const contactFormIdParamValue = params[CONTACT_FORM_ID_PARAM]
    const parsedId = parseInt(contactFormIdParamValue, 10)

    return {
        id: parsedId,
        isValid: !isNaN(parsedId),
    }
}
