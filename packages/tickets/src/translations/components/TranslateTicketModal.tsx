import { useEffect, useMemo, useState } from 'react'

import type { TranslationLanguageOption } from '@repo/utils'

import {
    Box,
    Button,
    ListItem,
    ListSection,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SelectField,
    Text,
} from '@gorgias/axiom'
import type { Language, TicketMessage } from '@gorgias/helpdesk-types'

import { useRetranslateTicket } from '../hooks/useRetranslateTicket'
import type { TranslationLanguageSection } from '../hooks/useTicketTranslationLanguageOptions'
import { useTicketTranslationLanguageOptions } from '../hooks/useTicketTranslationLanguageOptions'

type TranslateTicketModalProps = {
    isOpen: boolean
    isLoading: boolean
    onOpenChange: (open: boolean) => void
    ticketId: number
    ticketLanguage?: Language | null
    ticketMessages?: TicketMessage[]
}

export function TranslateTicketModal({
    isOpen,
    isLoading,
    onOpenChange,
    ticketId,
    ticketLanguage,
    ticketMessages = [],
}: TranslateTicketModalProps) {
    const {
        detectedLanguage,
        searchTerm,
        sections,
        resetSearch,
        setSearchTerm,
    } = useTicketTranslationLanguageOptions(ticketLanguage)
    const { retranslateTicket, isRetranslatingTicket, primary } =
        useRetranslateTicket({
            ticketId,
            ticketMessages,
        })
    const [selectedLanguage, setSelectedLanguage] = useState<
        TranslationLanguageOption | undefined
    >(detectedLanguage)

    useEffect(() => {
        if (!isOpen) {
            resetSearch()
            return
        }

        setSelectedLanguage(detectedLanguage)
    }, [detectedLanguage, isOpen, resetSearch])

    const allLanguageOptions = useMemo(
        () => sections.flatMap((section) => section.items),
        [sections],
    )
    const hasSelectedDifferentLanguage =
        selectedLanguage?.code !== ticketLanguage

    const handleTranslate = () => {
        if (!selectedLanguage) {
            return
        }

        onOpenChange(false)
        void retranslateTicket(selectedLanguage.code as Language)
    }

    return (
        <Modal size={ModalSize.Sm} isOpen={isOpen} onOpenChange={onOpenChange}>
            <OverlayHeader title="Translate ticket" />
            <OverlayContent>
                <Box flexDirection="column" gap="md" width="100%">
                    <Text size="md" color="content-neutral-secondary">
                        Please select the source language of the ticket. It will
                        be translated into the default language configured in
                        your user settings.
                    </Text>
                    <Text size="md" color="content-neutral-secondary">
                        This will also change the ticket&apos;s language
                        property and any rules using this language will be
                        applied to the ticket.
                    </Text>
                    <SelectField<
                        TranslationLanguageOption,
                        TranslationLanguageSection
                    >
                        label="Translate from"
                        placeholder="Select source language"
                        items={sections}
                        keyName="code"
                        maxHeight={352}
                        value={selectedLanguage}
                        onChange={(
                            language: TranslationLanguageOption | undefined,
                        ) => setSelectedLanguage(language)}
                        isSearchable
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        isDisabled={isLoading || isRetranslatingTicket}
                        placement="bottom left"
                        shouldFlip={false}
                    >
                        {(section: TranslationLanguageSection) => (
                            <ListSection
                                id={section.id}
                                name={section.name}
                                items={section.items}
                            >
                                {(option) => (
                                    <ListItem
                                        key={option.code}
                                        id={option.code}
                                        label={option.name}
                                        textValue={option.name}
                                    />
                                )}
                            </ListSection>
                        )}
                    </SelectField>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        isDisabled={isRetranslatingTicket}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleTranslate}
                        isLoading={isRetranslatingTicket}
                        isDisabled={
                            isLoading ||
                            !primary ||
                            !selectedLanguage ||
                            !hasSelectedDifferentLanguage ||
                            allLanguageOptions.length === 0
                        }
                    >
                        Translate
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
