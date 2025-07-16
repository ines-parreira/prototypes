import { useCallback } from 'react'

import { useCreateStoreMapping } from 'models/storeMapping/queries'

interface ContactForm {
    integration_id?: number | null
    shop_integration_id?: number | null
}

export default function useViewStoreMapping() {
    const { mutate: createMapping } = useCreateStoreMapping()

    const handleStoreMapping = useCallback(
        (contactForm: ContactForm) => {
            if (contactForm.integration_id && contactForm.shop_integration_id) {
                createMapping([
                    {
                        store_id: contactForm.shop_integration_id,
                        integration_id: contactForm.integration_id,
                    },
                ])
            }
        },
        [createMapping],
    )

    return {
        handleStoreMapping,
    }
}
