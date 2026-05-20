import { useRef, useState } from 'react'

import { useController } from 'react-hook-form'

import {
    Box,
    Card,
    CardHeader,
    Link,
    Skeleton,
    Text,
    TextAreaField,
    ToggleField,
} from '@gorgias/axiom'

import type { SettingsFormValues } from 'AIJourney/pages/Settings/Settings'
import { useJourneyContext } from 'AIJourney/providers'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { StarterPromptModal } from './StarterPromptModal'

const TONE_OF_VOICE_MAX_LENGTH = 2000
const TONE_OF_VOICE_CARD_WIDTH = 610

type ToneOfVoiceCardProps = {
    isFormReady: boolean
}

export const ToneOfVoiceCard = ({ isFormReady }: ToneOfVoiceCardProps) => {
    const { shopName } = useJourneyContext()
    const aiAgentToneOfVoiceUrl =
        getAiAgentNavigationRoutes(shopName).toneOfVoice
    const [isStarterPromptOpen, setIsStarterPromptOpen] = useState(false)
    const stashedValueRef = useRef<string>('')

    const {
        field: { value, onChange },
        fieldState: { error },
    } = useController<SettingsFormValues, 'tone_of_voice_guidance'>({
        name: 'tone_of_voice_guidance',
        rules: {
            validate: (fieldValue) => {
                if (fieldValue === null) return true
                if (fieldValue.trim() === '') {
                    return 'Tone of voice guidance is required.'
                }
                return true
            },
        },
    })

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton width={TONE_OF_VOICE_CARD_WIDTH} height={200} />
            </Box>
        )
    }

    const isCustomEnabled = value !== null
    const textValue = value ?? ''
    // .length matches the browser's maxLength enforcement (UTF-16 code units).
    const usedChars = textValue.length

    const handleToggle = (next: boolean) => {
        if (next) {
            onChange(stashedValueRef.current)
        } else {
            stashedValueRef.current = textValue
            onChange(null)
        }
    }

    return (
        <Card gap="lg" width={TONE_OF_VOICE_CARD_WIDTH}>
            <Box flexDirection="column" gap="xxs">
                <CardHeader title="Tone of voice" />
                <Text color="var(--content-neutral-secondary)">
                    By default, AI Journey follows your{' '}
                    <Link href={aiAgentToneOfVoiceUrl} target="_blank">
                        AI Agent tone of voice
                    </Link>
                    .
                </Text>
            </Box>
            <ToggleField
                label="Use custom tone of voice"
                caption="Customize tone of voice for marketing conversations."
                value={isCustomEnabled}
                onChange={handleToggle}
            />
            {isCustomEnabled && (
                <Box flexDirection="column" gap="xs">
                    <TextAreaField
                        label="Tone of voice guidance"
                        isRequired
                        value={textValue}
                        onChange={onChange}
                        error={error?.message}
                        maxLength={TONE_OF_VOICE_MAX_LENGTH}
                        autoResize
                        rows={6}
                    />
                    <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        gap="sm"
                        width="100%"
                    >
                        <Text size="sm">
                            Not sure where to start? Use this{' '}
                            <Link
                                size="sm"
                                onClick={() => setIsStarterPromptOpen(true)}
                            >
                                starter prompt
                            </Link>
                            .
                        </Text>
                        <Text size="sm">
                            {usedChars}/{TONE_OF_VOICE_MAX_LENGTH}
                        </Text>
                    </Box>
                </Box>
            )}
            <StarterPromptModal
                isOpen={isStarterPromptOpen}
                onClose={() => setIsStarterPromptOpen(false)}
            />
        </Card>
    )
}
