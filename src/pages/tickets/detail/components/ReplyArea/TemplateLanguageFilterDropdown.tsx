import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { SourceAddress } from 'models/ticket/types'
import { useListWhatsAppMessageTemplates } from 'models/whatsAppMessageTemplates/queries'
import { WhatsAppMessageTemplateStatus } from 'models/whatsAppMessageTemplates/types'
import Loader from 'pages/common/components/Loader/Loader'
import { normalizeLocale } from 'pages/integrations/integration/components/whatsapp/utils'
import SelectFilter from 'pages/stats/common/SelectFilter'
import { getNewPhoneNumberByNumber } from 'state/entities/phoneNumbers/selectors'
import { makeGetNewMessageSourceProperty } from 'state/newMessage/selectors'
import { getLanguageDisplayName } from 'utils'

type Props = {
    value: string[]
    onChange: (newValue: string[]) => void
}

export default function TemplateLanguageFilterDropdown({
    value,
    onChange,
}: Props) {
    const fromPhoneNumber = useAppSelector(makeGetNewMessageSourceProperty)(
        'from',
    )?.toJS?.() as SourceAddress
    const phoneNumber = useAppSelector(
        getNewPhoneNumberByNumber(fromPhoneNumber?.address),
    )

    const { data, isLoading } = useListWhatsAppMessageTemplates(
        {
            is_supported: true,
            waba_id: phoneNumber?.whatsapp_phone_number?.waba_id,
            status: WhatsAppMessageTemplateStatus.Approved,
        },
        {
            staleTime: 30 * 60 * 1000, // 30 minutes
        },
    )

    const availableLanguages = data?.data
        ? Array.from(new Set(data?.data.map((template) => template.language)))
        : []

    return (
        <SelectFilter
            plural="languages"
            singular="language"
            onChange={(newValue) => onChange(newValue as string[])}
            value={value}
            size="sm"
        >
            {isLoading ? (
                <Loader inline minHeight="100px" />
            ) : (
                availableLanguages.map((code) => (
                    <SelectFilter.Item
                        key={code}
                        value={code}
                        label={
                            getLanguageDisplayName(normalizeLocale(code)) ??
                            code
                        }
                    />
                ))
            )}
        </SelectFilter>
    )
}
