import { useEffect, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { SelectField } from '@gorgias/axiom'
import {
    queryKeys,
    useGetCompany,
    useUpsertCompany,
} from '@gorgias/helpdesk-queries'
import { Partner } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import Loader from 'pages/common/components/Loader/Loader'
import { convertPartnerEnumToOptions } from 'pages/settings/new_billing/components/ConsultingAgencyPartnerDropdown/utils'
import css from 'pages/settings/new_billing/views/PaymentInformationView/components/PartnerFields.less'
import { Section } from 'pages/settings/new_billing/views/PaymentInformationView/components/Section'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type PartnerOption = {
    value: string
    label: string
}

export const ConsultingAgencyPartnerSection = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const { data: companyData, isLoading } = useGetCompany({
        query: {
            retry: false,
            refetchOnWindowFocus: false,
        },
    })
    const { mutateAsync: updateCompany } = useUpsertCompany()

    const [consultingPartner, setConsultingPartner] = useState<Partner | null>(
        null,
    )

    const partnerOptions = useMemo(() => {
        const options = convertPartnerEnumToOptions(Partner)
        if (consultingPartner) {
            return [
                { value: '__clear__', label: 'Clear selection' },
                ...options,
            ]
        }
        return options
    }, [consultingPartner])

    const selectedOption = useMemo(() => {
        if (!consultingPartner) return null
        return partnerOptions.find(
            (option) => option.value === consultingPartner,
        )
    }, [consultingPartner, partnerOptions])

    useEffect(() => {
        if (companyData?.data) {
            setConsultingPartner(
                companyData.data.consulting_agency_partner ?? null,
            )
        }
    }, [companyData])

    const handleChange = async (option: PartnerOption | null) => {
        const currentConsultingPartner =
            companyData?.data?.consulting_agency_partner ?? null
        const currentBpoPartner = companyData?.data?.bpo_partner ?? null

        if (option?.value === '__clear__') {
            setConsultingPartner(null)
            try {
                await updateCompany({
                    data: {
                        consulting_agency_partner: null,
                        bpo_partner: currentBpoPartner,
                    },
                })
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.company.getCompany(),
                })
            } catch {
                setConsultingPartner(currentConsultingPartner)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to update consulting agency partner',
                    }),
                )
            }
            return
        }

        const value = option?.value as Partner | null
        setConsultingPartner(value)

        try {
            await updateCompany({
                data: {
                    consulting_agency_partner: value,
                    bpo_partner: currentBpoPartner,
                },
            })
            await queryClient.invalidateQueries({
                queryKey: queryKeys.company.getCompany(),
            })
        } catch {
            setConsultingPartner(currentConsultingPartner)
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to update consulting agency partner',
                }),
            )
        }
    }

    return (
        <Section
            icon="groups"
            title="Consulting agency partner"
            tooltip="Name of agency who supports your optimization work"
            tooltipTarget="consulting-agency-partner-info"
            noBorder
        >
            {isLoading ? (
                <Loader minHeight="auto" />
            ) : (
                <div className={css.dropdown}>
                    <SelectField<PartnerOption>
                        placeholder="Select an agency partner"
                        options={partnerOptions}
                        selectedOption={selectedOption}
                        optionMapper={(option) => ({
                            value: option.label,
                        })}
                        onChange={handleChange}
                    />
                </div>
            )}
        </Section>
    )
}
