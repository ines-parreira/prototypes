import { useCallback } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useCreateStoreMapping } from 'models/storeMapping/queries'

interface ContactForm {
    integration_id?: number | null
    shop_integration_id?: number | null
}

export default function useViewStoreMapping() {
    const { mutate: createMapping } = useCreateStoreMapping()
    const isMultiStoreEnabled = useFlag(FeatureFlagKey.MultiStore, false)

    const handleStoreMapping = useCallback(
        (contactForm: ContactForm) => {
            if (
                isMultiStoreEnabled &&
                contactForm.integration_id &&
                contactForm.shop_integration_id
            ) {
                createMapping([
                    {
                        store_id: contactForm.shop_integration_id,
                        integration_id: contactForm.integration_id,
                    },
                ])
            }
        },
        [isMultiStoreEnabled, createMapping],
    )

    return {
        handleStoreMapping,
        isMultiStoreEnabled,
    }
}
