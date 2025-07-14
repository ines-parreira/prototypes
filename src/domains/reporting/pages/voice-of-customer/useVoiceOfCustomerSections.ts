import { useCallback } from 'react'

import { AccordionValues } from 'components/Accordion/utils/types'
import {
    VOICE_OF_CUSTOMER_NAVBAR_SECTIONS_KEY,
    VoiceOfCustomerViewSections,
} from 'domains/reporting/pages/voice-of-customer/constants'
import useLocalStorage from 'hooks/useLocalStorage'

export const useVoiceOfCustomerSections = () => {
    const [sections, setSections] = useLocalStorage<AccordionValues>(
        VOICE_OF_CUSTOMER_NAVBAR_SECTIONS_KEY,
        Object.values(VoiceOfCustomerViewSections),
    )

    const handleNavigationStateChange = useCallback(
        (navigationValues: AccordionValues) => {
            setSections(navigationValues)
        },
        [setSections],
    )

    return {
        sections,
        handleNavigationStateChange,
    }
}
