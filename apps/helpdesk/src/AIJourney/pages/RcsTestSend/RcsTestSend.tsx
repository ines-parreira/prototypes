import { useReducer, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import type { CountryCode } from 'libphonenumber-js'
import { AsYouType } from 'libphonenumber-js'
import { useParams } from 'react-router-dom'
import { useAiJourneyPhoneList } from 'AIJourney/hooks/useAiJourneyPhoneList/useAiJourneyPhoneList'
import { useJourneyContext } from 'AIJourney/providers'
import { useRcsTestSend } from 'AIJourney/queries/useRcsTestSend/useRcsTestSend'
import { getCountryFromPhoneNumber } from 'pages/phoneNumbers/utils'
import { getCountryCallingCodeFixed } from 'pages/settings/helpCenter/utils/phoneCodeSelectOptions'

import {
    Banner,
    Box,
    Button,
    PanelHeader,
    TabItem,
    TabList,
    TabPanel,
    Tabs,
    Text,
} from '@gorgias/axiom'

import { RcsMessageCard } from '../../components/RcsMessageCard/RcsMessageCard'
import { RcsRequestCard } from '../../components/RcsRequestCard/RcsRequestCard'
import { RcsResponseSection } from '../../components/RcsResponseSection/RcsResponseSection'
import type { PhoneOption } from '../../types/RcsTestSend'
import { RcsBoundaryTests } from './RcsBoundaryTests'
import { buildRcsErrorView } from './rcsErrorView'
import { RcsTemplateReference } from './RcsTemplateReference'
import { INITIAL_FORM, messageFormReducer } from './reducer'
import { validateTemplateInputs } from './validateTemplateInputs'

import css from './RcsTestSend.less'

export const RcsTestSend = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const { storeConfiguration } = useJourneyContext()
    const { marketingCapabilityPhoneNumbers } = useAiJourneyPhoneList(
        storeConfiguration?.monitoredSmsIntegrations ?? [],
    )
    const { mutate, data: response, isLoading, error, reset } = useRcsTestSend()

    const [selectedOption, setSelectedOption] = useState<
        PhoneOption | undefined
    >(undefined)
    const [selectedCountryCode, setSelectedCountryCode] = useLocalStorage<
        CountryCode | undefined
    >('rcs-test-send-country-code', undefined)
    const [phoneInput, setPhoneInput] = useLocalStorage(
        'rcs-test-send-phone',
        '',
    )
    const [dryRun, setDryRun] = useState(false)
    const [form, dispatch] = useReducer(messageFormReducer, INITIAL_FORM)

    const phoneOptions: PhoneOption[] = marketingCapabilityPhoneNumbers.map(
        (phone) => {
            const smsIntegration = phone.integrations.find(
                (i) => i.type === 'sms',
            )!
            return {
                id: smsIntegration.id,
                label: phone.name,
                countryCode: getCountryFromPhoneNumber(phone.phone_number),
            }
        },
    )

    const callingCode = selectedCountryCode
        ? getCountryCallingCodeFixed(selectedCountryCode)
        : '1'
    const phoneDigits = phoneInput.replace(/\D/g, '')
    const recipientPhone = phoneDigits ? `+${callingCode}${phoneDigits}` : ''
    const integrationId = selectedOption?.id ?? undefined

    const templateValidation = validateTemplateInputs({
        productCount: form.productEntries.filter(
            (entry) => entry.shopifyProduct != null,
        ).length,
        urlButtonCount: form.buttons.filter(
            (b) => b.type === 'URL' && b.text.trim(),
        ).length,
        qrButtonCount: form.buttons.filter(
            (b) => b.type === 'QUICK_REPLY' && b.text.trim(),
        ).length,
        hasImage: form.image.trim().length > 0,
    })

    const isValid =
        integrationId != null &&
        recipientPhone.trim() &&
        form.contextText.trim() &&
        templateValidation.isValid

    const formatPhone = (value: string, code: CountryCode | undefined) => {
        const raw = value.replace(/\D/g, '')
        if (!raw) return ''
        return new AsYouType(code ?? 'US').input(raw)
    }

    const handlePhoneChange = (value: string) =>
        setPhoneInput(formatPhone(value, selectedCountryCode))

    const handleCountryChange = (code: CountryCode) => {
        setSelectedCountryCode(code)
        setPhoneInput((prev) => formatPhone(prev, code))
    }

    const handleSubmit = () => {
        if (
            !integrationId ||
            !recipientPhone.trim() ||
            !form.contextText.trim()
        )
            return

        const rcsProducts = form.productEntries
            .filter((e) => e.shopifyProduct != null)
            .map((e) => ({
                title: e.shopifyProduct!.title,
                ...(e.body.trim() && { body: e.body.trim() }),
                image: e.shopifyProduct!.image?.src ?? '',
                product_id: e.shopifyProduct!.id,
                variant_id: e.shopifyProduct!.variants[0]?.id ?? 0,
                url: e.url.trim() || null,
            }))
        const hasProductWithUrl = rcsProducts.some(
            (p) => p.url != null && p.url.length > 0,
        )
        const filteredButtons = form.buttons
            .filter((b) => b.text.trim())
            .map(({ id: __id, type, text, value }) => {
                const valueIsIgnored =
                    type === 'QUICK_REPLY' ||
                    (type === 'URL' && hasProductWithUrl)
                return { type, text, value: valueIsIgnored ? '' : value }
            })

        const sendImage =
            form.image.trim().length > 0 && rcsProducts.length === 0
        const titleCanRender =
            sendImage || filteredButtons.length > 0 || rcsProducts.length > 0

        mutate({
            integration_id: integrationId,
            recipient_phone: recipientPhone.trim(),
            dry_run: dryRun,
            rcs_context: {
                text: form.contextText.trim(),
                ...(titleCanRender &&
                    form.contextTitle.trim() && {
                        title: form.contextTitle.trim(),
                    }),
                ...(sendImage && { images: [form.image.trim()] }),
                ...(filteredButtons.length > 0 && { buttons: filteredButtons }),
                ...(rcsProducts.length > 0 && { products: rcsProducts }),
            },
        })
    }

    return (
        <Box width="100%" flexDirection="column">
            <PanelHeader title="RCS Test Send" />
            <Box width="100%" flexDirection="column" className={css.container}>
                <Banner
                    intent="warning"
                    icon="warning-triangle"
                    isClosable={false}
                    title="Internal tool"
                    description="Available for impersonated sessions only"
                    size="md"
                />
                <RcsTemplateReference />
                <Tabs defaultSelectedItem="test-send">
                    <TabList>
                        <TabItem id="test-send" label="Test send" />
                        <TabItem id="boundary-tests" label="Boundary tests" />
                    </TabList>
                    <TabPanel id="test-send">
                        <Box flexDirection="column" gap="md" width="100%">
                            <RcsRequestCard
                                phoneOptions={phoneOptions}
                                selectedOption={selectedOption}
                                onOptionChange={setSelectedOption}
                                phoneInput={phoneInput}
                                onPhoneChange={handlePhoneChange}
                                selectedCountryCode={selectedCountryCode}
                                onCountryChange={handleCountryChange}
                                dryRun={dryRun}
                                onDryRunChange={setDryRun}
                            />
                            <RcsMessageCard
                                form={form}
                                dispatch={dispatch}
                                shopName={shopName}
                            />
                            <Box flexDirection="row" gap="sm">
                                <Button
                                    onClick={handleSubmit}
                                    isDisabled={!isValid || isLoading}
                                >
                                    {isLoading
                                        ? 'Sending...'
                                        : dryRun
                                          ? 'Send (dry run)'
                                          : 'Send RCS test'}
                                </Button>
                                {(response != null || error != null) && (
                                    <Button variant="secondary" onClick={reset}>
                                        Clear
                                    </Button>
                                )}
                            </Box>
                            {!templateValidation.isValid &&
                                templateValidation.reason && (
                                    <Text>{templateValidation.reason}</Text>
                                )}
                            {error != null &&
                                (() => {
                                    const view = buildRcsErrorView(error)
                                    return (
                                        <>
                                            <Banner
                                                intent="destructive"
                                                icon="warning-triangle"
                                                isClosable={false}
                                                size="md"
                                                title={view.title}
                                                description={view.rawMessage}
                                            >
                                                {view.hint != null && (
                                                    <Text size="sm">
                                                        {view.hint}
                                                    </Text>
                                                )}
                                                {view.fieldErrors && (
                                                    <pre
                                                        className={
                                                            css.codeBlock
                                                        }
                                                    >
                                                        {JSON.stringify(
                                                            view.fieldErrors,
                                                            null,
                                                            2,
                                                        )}
                                                    </pre>
                                                )}
                                            </Banner>
                                            {view.responseData && (
                                                <RcsResponseSection
                                                    response={view.responseData}
                                                />
                                            )}
                                        </>
                                    )
                                })()}
                            {response && (
                                <RcsResponseSection response={response} />
                            )}
                        </Box>
                    </TabPanel>
                    <TabPanel id="boundary-tests">
                        <RcsBoundaryTests
                            integrationId={integrationId}
                            recipientPhone={recipientPhone}
                        />
                    </TabPanel>
                </Tabs>
            </Box>
        </Box>
    )
}
