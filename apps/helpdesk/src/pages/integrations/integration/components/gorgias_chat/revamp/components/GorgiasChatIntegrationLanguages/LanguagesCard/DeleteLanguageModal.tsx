import { useEffect, useState } from 'react'

import {
    Box,
    Button,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import type { LanguageItemRow } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationLanguages/types'

type Props = {
    language: LanguageItemRow | null
    isUpdatePending: boolean
    isOneClickInstallation: boolean | undefined
    onConfirm: () => void
    onDiscard: () => void
}

export const DeleteLanguageModal = ({
    language,
    isUpdatePending,
    isOneClickInstallation,
    onConfirm,
    onDiscard,
}: Props) => {
    const [label, setLabel] = useState('')

    useEffect(() => {
        if (language?.label) setLabel(language.label)
    }, [language?.label])

    return (
        <Modal
            size={ModalSize.Md}
            isOpen={Boolean(language)}
            onOpenChange={(isOpen) => {
                if (!isOpen && !isUpdatePending) onDiscard()
            }}
        >
            <OverlayHeader title={`Delete ${label}`} />
            <OverlayContent>
                <div>
                    <Text>
                        By deleting this language, your chat will not be
                        displayed in {label} anymore.
                    </Text>
                    {!isOneClickInstallation && (
                        <>
                            <br />
                            <br />
                            <Text>
                                For manually installed chats, you also need to
                                delete the script from the store&apos;s theme,
                                website code, or Google Tag Manager to remove it
                                from your website.
                            </Text>
                        </>
                    )}
                </div>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end">
                    <Button
                        intent={ButtonIntent.Regular}
                        size={ButtonSize.Md}
                        variant={ButtonVariant.Secondary}
                        isDisabled={isUpdatePending}
                        onClick={onDiscard}
                    >
                        Keep Language
                    </Button>
                    <Button
                        intent={ButtonIntent.Destructive}
                        size={ButtonSize.Md}
                        variant={ButtonVariant.Primary}
                        isLoading={isUpdatePending}
                        onClick={onConfirm}
                    >
                        Delete
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
