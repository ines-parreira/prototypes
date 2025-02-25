import React from 'react'

import { useWatch } from 'react-hook-form'

import { ABNField } from 'pages/settings/new_billing/components/BillingInformationFields/components/ABNField'
import { GSTHSTField } from 'pages/settings/new_billing/components/BillingInformationFields/components/GSTHSTField'
import { PSTField } from 'pages/settings/new_billing/components/BillingInformationFields/components/PSTField'
import { VATField } from 'pages/settings/new_billing/components/BillingInformationFields/components/VATField'
import { VATCountries } from 'state/billing/types'

export const TaxIdFields: React.FC = () => {
    const country: string = useWatch({ name: 'address.address.country' })

    if (country === 'CA') {
        return (
            <>
                <GSTHSTField />
                <PSTField />
            </>
        )
    }

    if (country === 'AU') {
        return <ABNField />
    }

    if (country in VATCountries) {
        return <VATField country={country} />
    }

    return null
}
