import { BILLING_INFORMATION_PATH } from '@repo/billing'
import { logEvent, SegmentEvent } from '@repo/logging'
import { Link } from 'react-router-dom'

import { countries } from 'config/countries'
import { useBillingContact } from 'models/billing/queries'
import Loader from 'pages/common/components/Loader/Loader'
import { DataRow } from 'pages/settings/new_billing/views/PaymentInformationView/components/DataRow'
import { Description } from 'pages/settings/new_billing/views/PaymentInformationView/components/Description'
import { Section } from 'pages/settings/new_billing/views/PaymentInformationView/components/Section'
import { TaxIdRows } from 'pages/settings/new_billing/views/PaymentInformationView/components/TaxIdRows'
import type {
    BillingContact,
    BillingContactDetailResponse,
} from 'state/billing/types'

export const BillingInformationSection = () => {
    return (
        <Section icon="person_pin_circle" title="Billing information">
            <ContentLoader />
        </Section>
    )
}

const ContentLoader: React.FC = () => {
    const billingInformation = useBillingContact()

    if (!billingInformation.data?.data) {
        return <Loader minHeight="auto" />
    }

    return <Content billingInformation={billingInformation.data.data} />
}

const Content: React.FC<{
    billingInformation: BillingContactDetailResponse
}> = ({ billingInformation }) => {
    const { name, phone, address } = billingInformation.shipping

    // Email is not taken into account because it defaults to the user's email
    const hasInformation = Object.values(address).some(
        (value) => !!value?.length,
    )

    return (
        <>
            <Description>
                <DataRow
                    label="Billing email"
                    value={billingInformation.email}
                />
                <DataRow label="Organization name" value={name} />
                <DataRow label="Phone number" value={phone} />
                <DataRow label="Address" value={getDisplayAddress(address)} />
                <TaxIdRows
                    taxIDs={billingInformation.tax_ids}
                    address={address}
                />
            </Description>
            <Link
                to={BILLING_INFORMATION_PATH}
                onClick={() => {
                    logEvent(
                        SegmentEvent.BillingPaymentInformationUpdateInformationClicked,
                    )
                }}
            >
                {hasInformation ? 'Update' : 'Add'} {'Information'}
            </Link>
        </>
    )
}

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
    countryCode?: BillingContact['shipping']['address']['country'],
) => {
    if (!countryCode?.length) {
        return ''
    }

    return (
        countries.find((country) => country.value === countryCode)?.label ??
        countryCode
    )
}
