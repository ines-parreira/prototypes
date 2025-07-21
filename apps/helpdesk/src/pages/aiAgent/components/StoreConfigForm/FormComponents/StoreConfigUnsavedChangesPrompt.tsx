import { useMemo } from 'react'

import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

const sectionNames = {
    [StoreConfigFormSection.generalSettings]: 'General settings',
    [StoreConfigFormSection.channelSettings]: 'Channel settings',
    [StoreConfigFormSection.handoverCustomizationOfflineSettings]:
        'Chat offline handover',
    [StoreConfigFormSection.handoverCustomizationOnlineSettings]:
        'Chat online handover',
    [StoreConfigFormSection.handoverCustomizationFallbackSettings]:
        'Chat error handover',
}

const MAIN_CONTENT_SECTIONS = [
    StoreConfigFormSection.generalSettings,
    StoreConfigFormSection.channelSettings,
]

const hasOnlyChangesOnMainContent = (dirtySections: StoreConfigFormSection[]) =>
    dirtySections.length === 1 &&
    MAIN_CONTENT_SECTIONS.includes(dirtySections[0])

const concatSectionTexts = (texts: string[]): string => {
    if (!texts.length) return ''
    if (texts.length === 1) return texts[0]

    const lastText = texts[texts.length - 1]
    const otherTexts = texts.slice(0, -1)

    return `${otherTexts.join(', ')} and ${lastText}`
}

const generateMessageBody = (dirtySections: StoreConfigFormSection[]) => {
    // if there are only general changes, let the prompt show the default message
    if (hasOnlyChangesOnMainContent(dirtySections)) return undefined

    const sectionTexts: string[] = []

    // first section will always be the general tab section
    if (dirtySections.includes(StoreConfigFormSection.generalSettings)) {
        sectionTexts.push(sectionNames[StoreConfigFormSection.generalSettings])
    }

    // second section will always be the channel tab section
    if (dirtySections.includes(StoreConfigFormSection.channelSettings)) {
        sectionTexts.push(sectionNames[StoreConfigFormSection.channelSettings])
    }

    dirtySections
        .filter((section) => !MAIN_CONTENT_SECTIONS.includes(section))
        .forEach((section) => sectionTexts.push(sectionNames[section]))

    return `Your updates in ${concatSectionTexts(sectionTexts)} will be lost unless saved individually.`
}

const generateMessageTitle = (dirtySections: StoreConfigFormSection[]) => {
    // if there are only general changes, let the prompt show the default message
    if (hasOnlyChangesOnMainContent(dirtySections)) return undefined

    return 'Unsaved changes'
}

export const StoreConfigUnsavedChangesPrompt = () => {
    const {
        dirtySections,
        isFormDirty,
        onModalDiscard,
        onModalSave,
        promptTriggerRef,
    } = useAiAgentFormChangesContext()

    const shouldShowSaveButton = useMemo(
        () =>
            hasOnlyChangesOnMainContent(
                dirtySections as StoreConfigFormSection[],
            ),
        [dirtySections],
    )

    const messageTitle = useMemo(
        () => generateMessageTitle(dirtySections as StoreConfigFormSection[]),
        [dirtySections],
    )

    const messageBody = useMemo(
        () => generateMessageBody(dirtySections as StoreConfigFormSection[]),
        [dirtySections],
    )

    return (
        <UnsavedChangesPrompt
            ref={promptTriggerRef}
            when={isFormDirty}
            onSave={onModalSave}
            onDiscard={onModalDiscard}
            shouldRedirectAfterSave={true}
            shouldShowSaveButton={shouldShowSaveButton}
            body={messageBody}
            title={messageTitle}
        />
    )
}
