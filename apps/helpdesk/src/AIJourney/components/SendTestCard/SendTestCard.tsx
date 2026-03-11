import { useEffect, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import type { CountryCode } from 'libphonenumber-js'
import { AsYouType } from 'libphonenumber-js'

import {
    Box,
    Button,
    Card,
    CardHeader,
    Size,
    Text,
    TextField,
    ToggleField,
} from '@gorgias/axiom'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import { CountryCodeSelect } from 'AIJourney/components/CountryCodeSelect/CountryCodeSelect'
import { ProductSelect } from 'AIJourney/components/ProductSelect/ProductSelect'
import { useHandleSendTestSMS } from 'AIJourney/hooks'
import { useAIJourneyProductList } from 'AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList'
import { useJourneyContext } from 'AIJourney/providers'
import type { Product } from 'constants/integrations/types/shopify'
import { getCountryCallingCodeFixed } from 'pages/settings/helpCenter/utils/phoneCodeSelectOptions'

import css from './SendTestCard.less'

type SendTestCardProps = {
    onProductChange?: (product: Product) => void
    onReturningCustomerChange?: (value: boolean) => void
}

const TEST_SMS_NUMBER_KEY = 'ai-journey-test-sms-number'

export const SendTestCard = ({
    onProductChange,
    onReturningCustomerChange,
}: SendTestCardProps) => {
    const [returningCustomer, setReturningCustomer] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
        undefined,
    )
    const [selectedFullProduct, setSelectedFullProduct] =
        useState<Product | null>(null)
    const [selectedCountryCode, setSelectedCountryCode] = useState<
        CountryCode | undefined
    >(undefined)
    const [phoneNumber, setPhoneNumber] = useLocalStorage(
        TEST_SMS_NUMBER_KEY,
        '',
    )
    const [isSending, setIsSending] = useState(false)

    const { currentIntegration, journeyType, journeyData } = useJourneyContext()
    const { productList } = useAIJourneyProductList({
        integrationId: currentIntegration?.id,
    })

    const isWelcome = journeyType === JourneyTypeEnum.Welcome
    const isCampaign = journeyType === JourneyTypeEnum.Campaign

    useEffect(() => {
        if (isWelcome) setSelectedFullProduct(null)
        else if (productList.length > 0 && !selectedFullProduct) {
            setSelectedFullProduct(productList[0])
        }
    }, [isWelcome, productList, selectedFullProduct])

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
        selectedProduct: selectedFullProduct,
        testSmsNumber,
        currentIntegration,
        returningCustomer,
    })

    const handleReturningCustomerChange = (value: boolean) => {
        setReturningCustomer(value)
        onReturningCustomerChange?.(value)
    }

    const handleSelect = (item: Product) => {
        setSelectedProduct(item)
        const fullProduct = productList.find((p) => p.id === item.id)
        if (fullProduct) {
            setSelectedFullProduct(fullProduct)
            onProductChange?.(fullProduct)
        }
    }

    const handleSendSms = async () => {
        setIsSending(true)
        try {
            await handleTestSms()
        } finally {
            setIsSending(false)
        }
    }

    const shouldRenderProductSelect = !isWelcome && !isCampaign

    return (
        <Card minWidth={680}>
            <Box flexDirection="column" gap={Size.Sm}>
                <Box flexDirection="column">
                    <CardHeader title="Send a test" />
                    <Text className={css.caption}>
                        Preview how your message will look on a real phone
                        before going live.
                    </Text>
                </Box>
                {isWelcome && (
                    <ToggleField
                        value={returningCustomer}
                        onChange={handleReturningCustomerChange}
                        label="Returning customer"
                    />
                )}
                {shouldRenderProductSelect && (
                    <ProductSelect
                        selectedProduct={selectedProduct}
                        setSelectedProduct={handleSelect}
                    />
                )}
                <Box alignItems="flex-end" gap={Size.Xs}>
                    <TextField
                        label="Phone number"
                        caption="You'll receive the message on this phone"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        leadingSlot={() => (
                            <CountryCodeSelect
                                selectedCountryCode={selectedCountryCode}
                                onCountryChange={handleCountryChange}
                            />
                        )}
                    />
                    <Button
                        variant="secondary"
                        onClick={handleSendSms}
                        isDisabled={!digits || isSending}
                        style={{ marginBottom: '20px' }}
                    >
                        Send SMS
                    </Button>
                </Box>
            </Box>
        </Card>
    )
}
