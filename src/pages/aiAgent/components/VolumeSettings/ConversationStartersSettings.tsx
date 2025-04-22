import { useFormContext } from 'react-hook-form'

import { Box, Label } from '@gorgias/merchant-ui-kit'

import { NewToggleButton } from 'pages/common/forms/NewToggleButton'

import css from './ConversationStartersSettings.less'

export const ConversationStartersSettings = ({
    isEnabled,
}: {
    isEnabled: boolean
}) => {
    const { watch, setValue } = useFormContext()
    const isConversationStartersEnabled = watch('isConversationStartersEnabled')

    return (
        <div className={css.wrapper}>
            <Box className={css.containerTitle} flexDirection="column">
                <Box>
                    <strong className={css.title}>Conversation Starters</strong>
                </Box>
                <Box>
                    <p className={css.body}>
                        Display up to 4 AI-generated conversation starters on
                        product pages. Starters are high-quality, relevant, and
                        easy to answer, tailored using your existing knowledge.
                        Note: This overrides Convert campaigns.
                    </p>
                </Box>
            </Box>
            <Box className={css.settingsGroup}>
                <Label className={css.label}>
                    Enable conversation starters
                    <NewToggleButton
                        checked={isConversationStartersEnabled}
                        isDisabled={!isEnabled}
                        onChange={() =>
                            setValue(
                                'isConversationStartersEnabled',
                                !isConversationStartersEnabled,
                                { shouldDirty: true },
                            )
                        }
                        stopPropagation
                    />
                </Label>
            </Box>
        </div>
    )
}
