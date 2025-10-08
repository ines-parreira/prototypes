import React from 'react'

import { BPOPartnerSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/BPOPartnerSection'
import { ConsultingAgencyPartnerSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/ConsultingAgencyPartnerSection'

export const PartnerFields = () => {
    return (
        <>
            <ConsultingAgencyPartnerSection />
            <BPOPartnerSection />
        </>
    )
}
