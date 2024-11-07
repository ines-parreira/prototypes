import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Link} from 'react-router-dom'

import {countries} from 'config/countries'
import {FeatureFlagKey} from 'config/featureFlags'
import {useBillingContact} from 'models/billing/queries'
import Loader from 'pages/common/components/Loader/Loader'
import {BILLING_INFORMATION_PATH} from 'pages/settings/new_billing/constants'
import {Description} from 'pages/settings/new_billing/views/PaymentInformationView/components/Description'
import {Section} from 'pages/settings/new_billing/views/PaymentInformationView/components/Section'
import {BillingContact} from 'state/billing/types'

export const BillingInformationSection = () => {
    const isTaxIdFieldEnabled = useFlags()[FeatureFlagKey.BillingTaxIdField]

    return (
        <Section
            icon="person_pin_circle"
            title={
                isTaxIdFieldEnabled ? 'Billing information' : 'Billing address'
            }
        >
            <Content />
        </Section>
    )
}

const Content: React.FC = () => {
    const isTaxIdFieldEnabled = useFlags()[FeatureFlagKey.BillingTaxIdField]

    const billingInformation = useBillingContact()

    if (!billingInformation.data?.data) {
        return <Loader minHeight="auto" />
    }

    const data = billingInformation.data.data
    const {name, phone, address} = data.shipping

    // Email is not taken into account because it defaults to the user's email
    const hasInformation = Object.values(address).some(
        (value) => !!value.length
    )

    return (
        <>
            <Description>
                <DataRow label="Billing email" value={data.email} />
                <DataRow
                    label={`${isTaxIdFieldEnabled ? 'Organization' : 'Company'} name`}
                    value={name}
                />
                <DataRow label="Phone number" value={phone} />
                <DataRow label="Address" value={getDisplayAddress(address)} />
            </Description>
            <Link to={BILLING_INFORMATION_PATH}>
                {hasInformation ? 'Update' : 'Add'}{' '}
                {isTaxIdFieldEnabled ? 'Information' : 'address'}
            </Link>
        </>
    )
}

const DataRow: React.FC<{label: string; value?: string | null}> = ({
    label,
    value,
}) => (
    <div>
        <strong>{label}:</strong> {value?.length ? value : '-'}
    </div>
)

const getDisplayAddress = (address: BillingContact['shipping']['address']) => {
    const firstPart = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
    ]
        .filter((value) => !!value)
        .join(', ')

    const secondPart = getDisplayCountry(address.country)

    if (!firstPart.length && !secondPart.length) {
        return ''
    }

    return `${firstPart} - ${secondPart}`
}

const getDisplayCountry = (
    countryCode?: BillingContact['shipping']['address']['country']
) => {
    if (!countryCode?.length) {
        return ''
    }

    return (
        countries.find((country) => country.value === countryCode)?.label ??
        countryCode
    )
}
