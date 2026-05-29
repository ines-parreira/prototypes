import { useEffect, useState } from 'react'

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
    ToggleField,
} from '@gorgias/axiom'
import { CountryCodeSelect } from 'AIJourney/components/CountryCodeSelect/CountryCodeSelect'
import { ProductSelect } from 'AIJourney/components/ProductSelect/ProductSelect'
import { JOURNEY_TYPES } from 'AIJourney/constants'
import { useHandleSendTestSMS, useLastSelectedProduct } from 'AIJourney/hooks'
import { useAIJourneyProductList } from 'AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList'
import { useJourneyContext } from 'AIJourney/providers'
import type { Product } from 'constants/integrations/types/shopify'
import { getCountryCallingCodeFixed } from 'pages/settings/helpCenter/utils/phoneCodeSelectOptions'

const TEST_SMS_NUMBER_KEY = 'ai-journey-test-sms-number'
const TEST_SMS_COUNTRY_CODE_KEY = 'ai-journey-test-sms-country-code'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export const SendTestSMSModal = ({ isOpen, onClose }: Props) => {
    const { journeyData, currentIntegration, journeyType } = useJourneyContext()
    const { resolveProduct, setLastSelectedProductId } =
        useLastSelectedProduct()

    const [returningCustomer, setReturningCustomer] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
        undefined,
    )
    const [selectedFullProduct, setSelectedFullProduct] =
        useState<Product | null>(null)
    const [selectedCountryCode, setSelectedCountryCode] = useLocalStorage<
        CountryCode | undefined
    >(TEST_SMS_COUNTRY_CODE_KEY, undefined)
    const [phoneNumber, setPhoneNumber] = useLocalStorage(
        TEST_SMS_NUMBER_KEY,
        '',
    )
    const [isSending, setIsSending] = useState(false)

    const { productList } = useAIJourneyProductList({
        integrationId: currentIntegration?.id,
    })

    const isWelcome = journeyType === JOURNEY_TYPES.WELCOME
    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN
    const isWinBack = journeyType === JOURNEY_TYPES.WIN_BACK
    const shouldRenderProductSelect = !isWelcome && !isCampaign && !isWinBack

    useEffect(() => {
        if (isWelcome) setSelectedFullProduct(null)
        else if (productList.length > 0 && !selectedFullProduct) {
            const resolved = resolveProduct(productList)
            if (resolved) {
                setSelectedFullProduct(resolved)
                setSelectedProduct(resolved)
            }
        }
    }, [isWelcome, productList, selectedFullProduct, resolveProduct])

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

    const handleProductSelect = (item: Product) => {
        setSelectedProduct(item)
        const fullProduct = productList.find((p) => p.id === item.id)
        if (fullProduct) {
            setSelectedFullProduct(fullProduct)
            setLastSelectedProductId(fullProduct.id)
        }
    }

    const { handleTestSms } = useHandleSendTestSMS({
        journeyData,
        selectedProduct: selectedFullProduct,
        testSmsNumber,
        currentIntegration,
        returningCustomer,
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
                    {isWelcome && (
                        <ToggleField
                            value={returningCustomer}
                            onChange={setReturningCustomer}
                            label="Returning customer"
                        />
                    )}
                    {shouldRenderProductSelect && (
                        <ProductSelect
                            selectedProduct={selectedProduct}
                            setSelectedProduct={handleProductSelect}
                        />
                    )}
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
