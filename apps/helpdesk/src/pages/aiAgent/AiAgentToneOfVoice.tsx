import { useCallback, useMemo, useState } from 'react'

import { useEffectOnce } from '@repo/hooks'

import {
    Box,
    Button,
    Heading,
    ListItem,
    SelectField,
    TabItem,
    TabList,
    Tabs,
    TextAreaField,
    ToggleField,
} from '@gorgias/axiom'

import { EmojiPicker } from 'components/EmojiPicker/EmojiPicker'
import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import type { StoreConfiguration, Verbosity } from 'models/aiAgent/types'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useDisplayPlaygroundButtonInLayoutHeader } from './components/AiAgentLayout/usePlaygroundButtonInLayoutHeader'
import { PersonalitySelector } from './components/StoreConfigForm/FormComponents/PersonalitySelector'
import type { ToneOfVoice } from './constants'
import { CHANGES_SAVED_SUCCESS } from './constants'
import { usePlaygroundPanel } from './hooks/usePlaygroundPanel'
import CollapsibleSection from './Onboarding/components/CollapsibleSection/CollapsibleSection'
import { useShopNameResolution } from './PlaygroundV2/hooks/useShopNameResolution'
import { useAiAgentStoreConfigurationContext } from './providers/AiAgentStoreConfigurationContext'

import css from './AiAgentToneOfVoice.less'

const TEXT_FIELD_CHARACTER_LIMIT = 600
const CUSTOM_PERSONALITY_CHARACTER_LIMIT = 3000
const PER_CHANNEL_PER_PERSONALITY_CHARACTER_LIMIT = 1500

enum ToneOfVoiceTab {
    General = 'general',
    ChannelSpecific = 'channel-specific',
}

const VERBOSITY_OPTIONS: { id: Verbosity; name: string }[] = [
    {
        id: 'concise',
        name: 'Concise',
    },
    { id: 'balanced', name: 'Balanced' },
    {
        id: 'detailed',
        name: 'Detailed',
    },
]

const VERBOSITY_CAPTIONS: Record<Verbosity, string> = {
    concise: 'Brief and to the point',
    balanced: 'Moderate detail',
    detailed: 'Comprehensive explanations',
}

interface VerbositySelectFieldProps {
    value: Verbosity
    onChange: (verbosity: Verbosity) => void
}

const VerbositySelectField = ({
    value,
    onChange,
}: VerbositySelectFieldProps) => {
    return (
        <Box maxWidth="160px">
            <SelectField
                items={VERBOSITY_OPTIONS}
                value={
                    VERBOSITY_OPTIONS.find((opt) => opt.id === value) ||
                    VERBOSITY_OPTIONS[0]
                }
                onChange={(item: (typeof VERBOSITY_OPTIONS)[number]) =>
                    onChange(item.id)
                }
                label="Verbosity"
            >
                {(item: (typeof VERBOSITY_OPTIONS)[number]) => (
                    <ListItem
                        id={item.id}
                        label={item.name}
                        caption={VERBOSITY_CAPTIONS[item.id]}
                        textValue={item.name}
                    />
                )}
            </SelectField>
        </Box>
    )
}

const getSavedValues = (storeConfiguration: StoreConfiguration | undefined) => {
    if (!storeConfiguration) {
        return {
            genericToneOfVoice: '',
            customPersonality: '',
            greetingsGuidance: '',
            signoffGuidance: '',
            brandSpecificGuidance: '',
            forbiddenPhrases: '',
            emailInstructions: '',
            chatInstructions: '',
            smsInstructions: '',
            emailVerbosity: undefined,
            chatVerbosity: undefined,
            smsVerbosity: undefined,
            allowEmojis: false,
            allowedEmojis: '',
            forbiddenEmojis: '',
        }
    }

    const isCustomTone =
        storeConfiguration.toneOfVoice.toLowerCase() === 'custom'

    return {
        genericToneOfVoice: storeConfiguration.toneOfVoice || '',
        customPersonality: isCustomTone
            ? storeConfiguration.customToneOfVoiceGuidance || ''
            : '',
        greetingsGuidance:
            storeConfiguration.toneOfVoiceOptions?.greetingGuidance || '',
        signoffGuidance:
            storeConfiguration.toneOfVoiceOptions?.signOffGuidance || '',
        brandSpecificGuidance:
            storeConfiguration.toneOfVoiceOptions?.brandSpecificTerminology ||
            '',
        forbiddenPhrases:
            storeConfiguration.toneOfVoiceOptions?.forbiddenPhrases || '',
        emailInstructions:
            storeConfiguration.toneOfVoiceByChannel?.email?.customToneOfVoice ||
            '',
        chatInstructions:
            storeConfiguration.toneOfVoiceByChannel?.chat?.customToneOfVoice ||
            '',
        smsInstructions:
            storeConfiguration.toneOfVoiceByChannel?.sms?.customToneOfVoice ||
            '',
        emailVerbosity:
            storeConfiguration.toneOfVoiceByChannel?.email?.verbosity,
        chatVerbosity: storeConfiguration.toneOfVoiceByChannel?.chat?.verbosity,
        smsVerbosity: storeConfiguration.toneOfVoiceByChannel?.sms?.verbosity,
        allowEmojis:
            storeConfiguration.toneOfVoiceOptions?.emojisEnabled || false,
        allowedEmojis:
            storeConfiguration.toneOfVoiceOptions?.allowedEmojis || '',
        forbiddenEmojis:
            storeConfiguration.toneOfVoiceOptions?.forbiddenEmojis || '',
    }
}

export function AiAgentToneOfVoice() {
    const dispatch = useAppDispatch()
    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()

    const { togglePlayground, isPlaygroundOpen } = usePlaygroundPanel({
        collapseNavbar: false,
    })

    const { resolvedShopName } = useShopNameResolution()
    const shouldShowTestButton = useDisplayPlaygroundButtonInLayoutHeader({
        shopName: resolvedShopName,
        shopType: SHOPIFY_INTEGRATION_TYPE,
    })

    const [activeTab, setActiveTab] = useState<ToneOfVoiceTab>(
        ToneOfVoiceTab.General,
    )

    const savedValues = useMemo(
        () => getSavedValues(storeConfiguration),
        [storeConfiguration],
    )

    useEffectOnce(() => {
        togglePlayground()
    })

    const [genericToneOfVoice, setGenericToneOfVoice] = useState<string>(
        savedValues.genericToneOfVoice,
    )
    const [customPersonality, setCustomPersonality] = useState<string>(
        savedValues.customPersonality,
    )
    const [greetingsGuidance, setGreetingsGuidance] = useState<string>(
        savedValues.greetingsGuidance,
    )
    const [signoffGuidance, setSignoffGuidance] = useState<string>(
        savedValues.signoffGuidance,
    )
    const [brandSpecificGuidance, setBrandSpecificGuidance] = useState<string>(
        savedValues.brandSpecificGuidance,
    )
    const [forbiddenPhrases, setForbiddenPhrases] = useState<string>(
        savedValues.forbiddenPhrases,
    )
    const [validationError, setValidationError] = useState<boolean>(false)

    const [personalityExpanded, setPersonalityExpanded] =
        useState<boolean>(true)
    const [whatToSayExpanded, setWhatToSayExpanded] = useState<boolean>(true)
    const [whatToAvoidExpanded, setWhatToAvoidExpanded] =
        useState<boolean>(true)
    const [emojisExpanded, setEmojisExpanded] = useState<boolean>(true)

    const [emailExpanded, setEmailExpanded] = useState<boolean>(true)
    const [chatExpanded, setChatExpanded] = useState<boolean>(false)
    const [smsExpanded, setSmsExpanded] = useState<boolean>(false)

    const [emailInstructions, setEmailInstructions] = useState<string>(
        savedValues.emailInstructions,
    )
    const [chatInstructions, setChatInstructions] = useState<string>(
        savedValues.chatInstructions,
    )
    const [smsInstructions, setSmsInstructions] = useState<string>(
        savedValues.smsInstructions,
    )

    const [emailVerbosity, setEmailVerbosity] = useState<Verbosity>(
        savedValues.emailVerbosity ?? 'concise',
    )
    const [chatVerbosity, setChatVerbosity] = useState<Verbosity>(
        savedValues.chatVerbosity ?? 'concise',
    )
    const [smsVerbosity, setSmsVerbosity] = useState<Verbosity>(
        savedValues.smsVerbosity ?? 'concise',
    )

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [allowEmojis, setAllowEmojis] = useState<boolean>(
        savedValues.allowEmojis,
    )
    const [allowedEmojis, setAllowedEmojis] = useState<string>(
        savedValues.allowedEmojis,
    )
    const [forbiddenEmojis, setForbiddenEmojis] = useState<string>(
        savedValues.forbiddenEmojis,
    )

    const hasChanges = useCallback(() => {
        return (
            genericToneOfVoice !== savedValues.genericToneOfVoice ||
            customPersonality !== savedValues.customPersonality ||
            greetingsGuidance !== savedValues.greetingsGuidance ||
            signoffGuidance !== savedValues.signoffGuidance ||
            brandSpecificGuidance !== savedValues.brandSpecificGuidance ||
            forbiddenPhrases !== savedValues.forbiddenPhrases ||
            emailInstructions !== savedValues.emailInstructions ||
            chatInstructions !== savedValues.chatInstructions ||
            smsInstructions !== savedValues.smsInstructions ||
            emailVerbosity !== savedValues.emailVerbosity ||
            chatVerbosity !== savedValues.chatVerbosity ||
            smsVerbosity !== savedValues.smsVerbosity ||
            allowEmojis !== savedValues.allowEmojis ||
            allowedEmojis !== savedValues.allowedEmojis ||
            forbiddenEmojis !== savedValues.forbiddenEmojis
        )
    }, [
        savedValues,
        genericToneOfVoice,
        customPersonality,
        greetingsGuidance,
        signoffGuidance,
        brandSpecificGuidance,
        forbiddenPhrases,
        emailInstructions,
        chatInstructions,
        smsInstructions,
        emailVerbosity,
        chatVerbosity,
        smsVerbosity,
        allowEmojis,
        allowedEmojis,
        forbiddenEmojis,
    ])

    const isDirty = hasChanges()

    const handleSave = useCallback(async () => {
        if (!storeConfiguration) return

        setIsSubmitting(true)

        try {
            await updateStoreConfiguration({
                ...storeConfiguration,
                toneOfVoice: genericToneOfVoice as ToneOfVoice,
                customToneOfVoiceGuidance: customPersonality,
                toneOfVoiceByChannel: {
                    email: {
                        customToneOfVoice: emailInstructions,
                        ...(emailVerbosity && { verbosity: emailVerbosity }),
                    },
                    chat: {
                        customToneOfVoice: chatInstructions,
                        ...(chatVerbosity && { verbosity: chatVerbosity }),
                    },
                    sms: {
                        customToneOfVoice: smsInstructions,
                        ...(smsVerbosity && { verbosity: smsVerbosity }),
                    },
                },
                toneOfVoiceOptions: {
                    greetingGuidance: greetingsGuidance,
                    signOffGuidance: signoffGuidance,
                    brandSpecificTerminology: brandSpecificGuidance,
                    forbiddenPhrases: forbiddenPhrases,
                    emojisEnabled: allowEmojis,
                    allowedEmojis: allowedEmojis,
                    forbiddenEmojis: forbiddenEmojis,
                },
            })

            void dispatch(
                notify({
                    message: CHANGES_SAVED_SUCCESS,
                    status: NotificationStatus.Success,
                }),
            )
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to save tone of voice configuration',
                }),
            )
        } finally {
            setIsSubmitting(false)
        }
    }, [
        storeConfiguration,
        updateStoreConfiguration,
        genericToneOfVoice,
        customPersonality,
        emailInstructions,
        chatInstructions,
        smsInstructions,
        emailVerbosity,
        chatVerbosity,
        smsVerbosity,
        greetingsGuidance,
        signoffGuidance,
        brandSpecificGuidance,
        forbiddenPhrases,
        allowEmojis,
        allowedEmojis,
        forbiddenEmojis,
        dispatch,
    ])

    const handleDiscard = useCallback(() => {
        setGenericToneOfVoice(savedValues.genericToneOfVoice)
        setCustomPersonality(savedValues.customPersonality)
        setGreetingsGuidance(savedValues.greetingsGuidance)
        setSignoffGuidance(savedValues.signoffGuidance)
        setBrandSpecificGuidance(savedValues.brandSpecificGuidance)
        setForbiddenPhrases(savedValues.forbiddenPhrases)
        setEmailInstructions(savedValues.emailInstructions)
        setChatInstructions(savedValues.chatInstructions)
        setSmsInstructions(savedValues.smsInstructions)
        setEmailVerbosity(savedValues.emailVerbosity ?? 'concise')
        setChatVerbosity(savedValues.chatVerbosity ?? 'concise')
        setSmsVerbosity(savedValues.smsVerbosity ?? 'concise')
        setAllowEmojis(savedValues.allowEmojis)
        setAllowedEmojis(savedValues.allowedEmojis)
        setForbiddenEmojis(savedValues.forbiddenEmojis)
    }, [savedValues])

    const createCharacterLimitHandler = (
        setter: React.Dispatch<React.SetStateAction<string>>,
        limit: number = TEXT_FIELD_CHARACTER_LIMIT,
    ) => {
        return (value: string) => {
            const croppedValue = value.slice(0, limit)
            setter(croppedValue)
        }
    }

    if (!storeConfiguration) {
        return null
    }

    const generalContent = (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            width="100%"
            maxWidth="658px"
            gap="md"
            padding="lg"
        >
            <CollapsibleSection
                title="Personality"
                caption="Choose a personality that fits your brand or create your own. See examples."
                isExpanded={personalityExpanded}
                onToggle={() => setPersonalityExpanded(!personalityExpanded)}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    justifyContent="center"
                    width="100%"
                    gap="md"
                >
                    <PersonalitySelector
                        value={genericToneOfVoice}
                        onChange={setGenericToneOfVoice}
                    />
                    {genericToneOfVoice.toLowerCase() === 'custom' && (
                        <TextAreaField
                            value={customPersonality}
                            onChange={createCharacterLimitHandler(
                                setCustomPersonality,
                                CUSTOM_PERSONALITY_CHARACTER_LIMIT,
                            )}
                            label="AI Agent personality"
                            placeholder="Use friendly, natural, but not too formal language. Create a warm atmosphere and make the customer feel supported and confident in our help. Keep responses brief, clear, and respectful of the customer's time."
                            caption={`${customPersonality.length}/${CUSTOM_PERSONALITY_CHARACTER_LIMIT}`}
                            rows={3}
                        />
                    )}
                </Box>
            </CollapsibleSection>
            <CollapsibleSection
                title="What to say"
                caption="Define the words, phrases, and message patterns AI Agent should use."
                isExpanded={whatToSayExpanded}
                onToggle={() => setWhatToSayExpanded(!whatToSayExpanded)}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    justifyContent="center"
                    width="100%"
                    height="100%"
                    gap="lg"
                >
                    <TextAreaField
                        value={greetingsGuidance}
                        onChange={createCharacterLimitHandler(
                            setGreetingsGuidance,
                        )}
                        label="Greeting"
                        placeholder={`Always use friendly greetings, such as "Hi [Customer's First Name]" or "Hey [Customer's First Name]". Not "Hello" or "Dear"`}
                        caption={`${greetingsGuidance.length}/${TEXT_FIELD_CHARACTER_LIMIT}`}
                        rows={2}
                    />
                    <TextAreaField
                        value={signoffGuidance}
                        onChange={createCharacterLimitHandler(
                            setSignoffGuidance,
                        )}
                        label="Sign-off"
                        placeholder={`Always include a closing statement at the end of your response: "If you have any other questions, feel free to reach out!"`}
                        caption={`${signoffGuidance.length}/${TEXT_FIELD_CHARACTER_LIMIT}`}
                        rows={2}
                    />
                    <TextAreaField
                        value={brandSpecificGuidance}
                        onChange={createCharacterLimitHandler(
                            setBrandSpecificGuidance,
                        )}
                        label="Brand-specific terminology or acronyms"
                        placeholder={`Don't use the brand name; instead, speak on behalf of the brand using "we/us/our". Always capitalize our product names.`}
                        caption={`${brandSpecificGuidance.length}/${TEXT_FIELD_CHARACTER_LIMIT}`}
                        rows={2}
                    />
                </Box>
            </CollapsibleSection>
            <CollapsibleSection
                title="What to avoid"
                caption="Call out words, phrases, or behaviors AI Agent should not use."
                isExpanded={whatToAvoidExpanded}
                onToggle={() => setWhatToAvoidExpanded(!whatToAvoidExpanded)}
            >
                <TextAreaField
                    value={forbiddenPhrases}
                    onChange={createCharacterLimitHandler(setForbiddenPhrases)}
                    label="Forbidden words, phrases, or behaviors"
                    placeholder={`Avoid humor, slang, or exaggerated claims. Use "gift card" instead of "store credit".`}
                    caption={`${forbiddenPhrases.length}/${TEXT_FIELD_CHARACTER_LIMIT}`}
                    rows={2}
                />
            </CollapsibleSection>
            <CollapsibleSection
                isExpanded={emojisExpanded}
                onToggle={() => setEmojisExpanded(!emojisExpanded)}
                title="Emojis"
            >
                <Box display="flex" flexDirection="column" gap="lg">
                    <ToggleField
                        label="Allow emojis"
                        caption="Only when relevant and sparingly per message"
                        value={allowEmojis}
                        onChange={() => setAllowEmojis(!allowEmojis)}
                    />
                    <Box
                        display={allowEmojis ? 'flex' : 'none'}
                        flexDirection="column"
                        gap="md"
                    >
                        <EmojiPicker
                            label="Allowed emojis"
                            value={allowedEmojis}
                            onChange={setAllowedEmojis}
                            onError={setValidationError}
                        />
                        <EmojiPicker
                            label="Forbidden emojis"
                            value={forbiddenEmojis}
                            onChange={setForbiddenEmojis}
                            onError={setValidationError}
                        />
                    </Box>
                </Box>
            </CollapsibleSection>
            <div className={css.disclaimer}>
                By using AI Agent, you agree to comply with all applicable laws,
                including, but not limited to, laws prohibiting misleading
                consumers about the artificial identity of an automated online
                account, such as the California Bolstering Online Transparency
                Act.
            </div>
        </Box>
    )

    const channelSpecificContent = (
        <Box
            padding="lg"
            max-width="748px"
            display="flex"
            flexDirection="column"
            gap="lg"
        >
            <div className={css.channelInstructions}>
                Channel-specific instructions don’t replace your general
                instructions, they build on them. Use them to tailor tone,
                format, and to add extra detail for a specific channel.
            </div>

            <Box display="flex" flexDirection="column" gap="md">
                <CollapsibleSection
                    title="Email"
                    isExpanded={emailExpanded}
                    onToggle={() => setEmailExpanded(!emailExpanded)}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="md"
                        width="100%"
                    >
                        <VerbositySelectField
                            value={emailVerbosity}
                            onChange={setEmailVerbosity}
                        />
                        <TextAreaField
                            value={emailInstructions}
                            onChange={createCharacterLimitHandler(
                                setEmailInstructions,
                                PER_CHANNEL_PER_PERSONALITY_CHARACTER_LIMIT,
                            )}
                            label="Instructions"
                            placeholder="To sound more human, please never submit responses in numbered lists. Instead, separate by paragraphs."
                            caption={`${emailInstructions.length}/${PER_CHANNEL_PER_PERSONALITY_CHARACTER_LIMIT}`}
                            rows={3}
                        />
                    </Box>
                </CollapsibleSection>

                <CollapsibleSection
                    title="Chat"
                    isExpanded={chatExpanded}
                    onToggle={() => setChatExpanded(!chatExpanded)}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="md"
                        width="100%"
                    >
                        <VerbositySelectField
                            value={chatVerbosity}
                            onChange={setChatVerbosity}
                        />
                        <TextAreaField
                            value={chatInstructions}
                            onChange={createCharacterLimitHandler(
                                setChatInstructions,
                                PER_CHANNEL_PER_PERSONALITY_CHARACTER_LIMIT,
                            )}
                            label="Instructions"
                            placeholder="Keep replies brief, friendly, and conversational like talking to a good friend. Use small paragraphs (2–3 lines max) per message and get to the point quickly."
                            caption={`${chatInstructions.length}/${PER_CHANNEL_PER_PERSONALITY_CHARACTER_LIMIT}`}
                            rows={3}
                        />
                    </Box>
                </CollapsibleSection>

                <CollapsibleSection
                    title="SMS"
                    isExpanded={smsExpanded}
                    onToggle={() => setSmsExpanded(!smsExpanded)}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="md"
                        width="100%"
                    >
                        <VerbositySelectField
                            value={smsVerbosity}
                            onChange={setSmsVerbosity}
                        />
                        <TextAreaField
                            value={smsInstructions}
                            onChange={createCharacterLimitHandler(
                                setSmsInstructions,
                                PER_CHANNEL_PER_PERSONALITY_CHARACTER_LIMIT,
                            )}
                            label="Instructions"
                            placeholder="Keep it brief and upbeat (1–2 lines). No greeting or sign-off. Use simple language, include only essential info, and ask at most one question"
                            caption={`${smsInstructions.length}/${PER_CHANNEL_PER_PERSONALITY_CHARACTER_LIMIT}`}
                            rows={3}
                        />
                    </Box>
                </CollapsibleSection>
            </Box>
        </Box>
    )

    return (
        <>
            <UnsavedChangesPrompt
                onSave={handleSave}
                when={isDirty && !validationError}
                onDiscard={handleDiscard}
                shouldRedirectAfterSave
            />
            <Box display="flex" flexDirection="column" flex={1} minWidth="0px">
                <Box flexDirection="column" justifyContent="space-between">
                    <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        padding="lg"
                    >
                        <Heading size="lg">Tone of voice</Heading>
                        <Box display="flex" gap="sm">
                            {shouldShowTestButton && !isPlaygroundOpen && (
                                <Button
                                    onClick={togglePlayground}
                                    variant="secondary"
                                >
                                    Test
                                </Button>
                            )}
                            <Button
                                isDisabled={!isDirty || validationError}
                                isLoading={isSubmitting}
                                onClick={handleSave}
                                variant="primary"
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                    <Box width="100%" display="flex" flexDirection="column">
                        <Tabs
                            selectedItem={activeTab}
                            onSelectionChange={(tab) =>
                                setActiveTab(tab.valueOf() as ToneOfVoiceTab)
                            }
                        >
                            <TabList>
                                <TabItem
                                    key={ToneOfVoiceTab.General}
                                    id={ToneOfVoiceTab.General}
                                    label="General"
                                />
                                <TabItem
                                    key={ToneOfVoiceTab.ChannelSpecific}
                                    id={ToneOfVoiceTab.ChannelSpecific}
                                    label="Channel-specific"
                                />
                            </TabList>
                        </Tabs>
                    </Box>
                </Box>
                <div className={css.contentContainer}>
                    {activeTab === ToneOfVoiceTab.General && generalContent}
                    {activeTab === ToneOfVoiceTab.ChannelSpecific &&
                        channelSpecificContent}
                </div>
            </Box>
        </>
    )
}
