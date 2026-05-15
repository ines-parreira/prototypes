import { useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import type { CountryCode } from 'libphonenumber-js'
import { AsYouType } from 'libphonenumber-js'

import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
    TextField,
} from '@gorgias/axiom'

import { CountryCodeSelect } from 'AIJourney/components/CountryCodeSelect/CountryCodeSelect'
import { useHandleSendTestSMS } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import { getCountryCallingCodeFixed } from 'pages/settings/helpCenter/utils/phoneCodeSelectOptions'

const TEST_SMS_NUMBER_KEY = 'ai-journey-test-sms-number'
const TEST_SMS_COUNTRY_CODE_KEY = 'ai-journey-test-sms-country-code'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export const SendTestSMSModal = ({ isOpen, onClose }: Props) => {
    const { journeyData, currentIntegration } = useJourneyContext()
    const [selectedCountryCode, setSelectedCountryCode] = useLocalStorage<
        CountryCode | undefined
    >(TEST_SMS_COUNTRY_CODE_KEY, undefined)
    const [phoneNumber, setPhoneNumber] = useLocalStorage(
        TEST_SMS_NUMBER_KEY,
        '',
    )
    const [isSending, setIsSending] = useState(false)

    const callingCode = selectedCountryCode
        ? getCountryCallingCodeFixed(selectedCountryCode)
        : '1'
    const digits = phoneNumber.replace(/\D/g, '')
    const testSmsNumber = digits ? `+${callingCode}${digits}` : ''

    const formatPhone = (value: string, code: CountryCode | undefined) => {
        const rawDigits = value.replace(/\D/g, '')
        if (!rawDigits) return ''
        return new AsYouType(code ?? 'US').input(rawDigits)
    }

    const handlePhoneChange = (value: string) => {
        setPhoneNumber(formatPhone(value, selectedCountryCode))
    }

    const handleCountryChange = (code: CountryCode) => {
        setSelectedCountryCode(code)
        setPhoneNumber((prev) => formatPhone(prev, code))
    }

    const { handleTestSms } = useHandleSendTestSMS({
        journeyData,
        selectedProduct: null,
        testSmsNumber,
        currentIntegration,
        returningCustomer: false,
    })

    const handleSend = async () => {
        setIsSending(true)
        try {
            await handleTestSms()
            onClose()
        } finally {
            setIsSending(false)
        }
    }

    return (
        <Modal
            size="sm"
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <OverlayHeader title="Send test SMS" />
            <OverlayContent>
                <Box flexDirection="column" gap="md">
                    <Text size="sm" color="var(--content-neutral-secondary)">
                        Preview how your message will look on a real phone.
                        We&apos;ll send a test SMS to the number you enter.
                    </Text>
                    <TextField
                        label="Phone number"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        leadingSlot={() => (
                            <CountryCodeSelect
                                selectedCountryCode={selectedCountryCode}
                                onCountryChange={handleCountryChange}
                            />
                        )}
                    />
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Button onClick={handleSend} isDisabled={!digits || isSending}>
                    Send test
                </Button>
            </OverlayFooter>
        </Modal>
    )
}
