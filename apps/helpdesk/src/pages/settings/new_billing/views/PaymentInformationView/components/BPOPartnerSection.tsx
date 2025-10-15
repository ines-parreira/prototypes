import { useEffect, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { LegacySelectField as SelectField } from '@gorgias/axiom'
import {
    queryKeys,
    useGetCompany,
    useUpsertCompany,
} from '@gorgias/helpdesk-queries'
import { BPOPartner } from '@gorgias/helpdesk-types'

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

export const BPOPartnerSection = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const { data: companyData, isLoading } = useGetCompany({
        query: {
            retry: false,
            refetchOnWindowFocus: false,
        },
    })
    const { mutateAsync: updateCompany } = useUpsertCompany()

    const [bpoPartner, setBpoPartner] = useState<BPOPartner | null>(null)

    const partnerOptions = useMemo(() => {
        const options = convertPartnerEnumToOptions(BPOPartner)
        if (bpoPartner) {
            return [
                { value: '__clear__', label: 'Clear selection' },
                ...options,
            ]
        }
        return options
    }, [bpoPartner])

    const selectedOption = useMemo(() => {
        if (!bpoPartner) return null
        return partnerOptions.find((option) => option.value === bpoPartner)
    }, [bpoPartner, partnerOptions])

    useEffect(() => {
        if (companyData?.data) {
            setBpoPartner(companyData.data.bpo_partner ?? null)
        }
    }, [companyData])

    const handleChange = async (option: PartnerOption | null) => {
        const currentConsultingPartner =
            companyData?.data?.consulting_agency_partner ?? null
        const currentBpoPartner = companyData?.data?.bpo_partner ?? null

        if (option?.value === '__clear__') {
            setBpoPartner(null)
            try {
                await updateCompany({
                    data: {
                        consulting_agency_partner: currentConsultingPartner,
                        bpo_partner: null,
                    },
                })
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.company.getCompany(),
                })
            } catch {
                setBpoPartner(currentBpoPartner)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to update BPO partner',
                    }),
                )
            }
            return
        }

        const value = option?.value as BPOPartner | null
        setBpoPartner(value)

        try {
            await updateCompany({
                data: {
                    consulting_agency_partner: currentConsultingPartner,
                    bpo_partner: value,
                },
            })
            await queryClient.invalidateQueries({
                queryKey: queryKeys.company.getCompany(),
            })
        } catch {
            setBpoPartner(currentBpoPartner)
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to update BPO partner',
                }),
            )
        }
    }

    return (
        <Section
            icon="groups"
            title="BPO partner"
            tooltip="Name of partner providing your outsourced agents"
            tooltipTarget="bpo-partner-info"
            noBorder
        >
            {isLoading ? (
                <Loader minHeight="auto" />
            ) : (
                <div className={css.dropdown}>
                    <SelectField<PartnerOption>
                        placeholder="Select BPO partner"
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
