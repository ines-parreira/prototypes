import type { Map } from 'immutable'
import { get } from 'lodash'

import {
    Banner,
    Button,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Icon,
    IconName,
    ListItem,
    SelectField,
    Skeleton,
} from '@gorgias/axiom'

import type { LanguageChat } from 'constants/languages'
import { useGorgiasChatCreationWizardContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { GorgiasChatRevampLayout } from '../../GorgiasChatRevampLayout'
import SaveChangesPrompt from '../GorgiasChatCreationWizard/components/SaveChangesPrompt'
import { TranslateInputRow } from './components/TranslateInputRow'
import { TranslateSection } from './components/TranslateSection'
import { TranslateUnsavedChangesModal } from './components/TranslateUnsavedChangesModal'
import { useGorgiasTranslateText } from './hooks/useGorgiasTranslateText'
import { useTranslateSections } from './hooks/useTranslateSections'

import css from './GorgiasChatIntegrationTranslateText.less'

type Props = {
    integration: Map<string, unknown>
}

export const GorgiasChatIntegrationTranslateTextRevamp = ({
    integration,
}: Props) => {
    const {
        language,
        handleLanguageChange,
        handleBackClick,
        languagePickerLanguages,
        textsOfSelectedLanguage,
        translations,
        dependenciesLoaded,
        hasChanges,
        isSubmitting,
        submitData,
        saveKeyValue,
        isDefaultLanguageLoaded,
        isAutomateSubscriber,
        isExitModalOpen,
        isLanguageChangeModalOpen,
        onCloseModals,
        onDiscardChangesAndExit,
        onSaveValuesAndExit,
        onDiscardChangesAndSwitchLanguage,
        onSaveValuesAndSwitchLanguage,
        emailCaptureEnforcement,
        integrationChat,
    } = useGorgiasTranslateText({ integration })

    const { resetPreview } = useGorgiasChatCreationWizardContext()

    const sections = useTranslateSections({
        isAutomateSubscriber,
        emailCaptureEnforcement,
        isDefaultLanguageLoaded,
        integrationChat,
    })

    const languageOptions = languagePickerLanguages.map((lang) => ({
        id: lang.value,
        value: lang.value,
        label: lang.label,
    }))

    const selectedLanguageOption = languageOptions.find(
        (opt) => opt.value === language?.get('value'),
    )

    const languageSelector = (
        <div className={css.languageSelector}>
            <SelectField
                aria-label="Current language"
                items={languageOptions}
                value={selectedLanguageOption}
                onChange={(option: (typeof languageOptions)[number]) =>
                    handleLanguageChange(option.value as LanguageChat)
                }
            >
                {(option: (typeof languageOptions)[number]) => (
                    <ListItem label={option.label} />
                )}
            </SelectField>
        </div>
    )

    const backButton = (
        <Button
            size={ButtonSize.Md}
            variant={ButtonVariant.Tertiary}
            intent={ButtonIntent.Regular}
            leadingSlot={<Icon name={IconName.ArrowLeft} />}
            onClick={handleBackClick}
        >
            Back
        </Button>
    )

    const advancedCustomizationBanner = (
        <Banner
            variant="inline"
            intent="info"
            size="md"
            icon={IconName.Info}
            isClosable={false}
            description={
                <span>
                    <a
                        href="https://docs.gorgias.com/en-US/advanced-customization-new-chat-81792"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Advanced customization
                    </a>{' '}
                    overrides these settings.
                </span>
            }
        />
    )

    if (!dependenciesLoaded) {
        return (
            <GorgiasChatRevampLayout
                integration={integration}
                onSave={submitData}
                isSaveDisabled
                isSaving={isSubmitting}
            >
                <div className={css.content}>
                    <div className={css.header}>
                        {backButton}
                        {languageSelector}
                    </div>
                    {advancedCustomizationBanner}
                    <Skeleton height="160px" />
                    <Skeleton height="160px" />
                    <Skeleton height="160px" />
                </div>
            </GorgiasChatRevampLayout>
        )
    }

    return (
        <>
            <SaveChangesPrompt
                when={hasChanges}
                onSave={submitData}
                onDiscard={resetPreview}
                shouldRedirectAfterSave
            />
            <GorgiasChatRevampLayout
                integration={integration}
                onSave={submitData}
                isSaveDisabled={!hasChanges || isSubmitting}
                isSaving={isSubmitting}
            >
                <div className={css.content}>
                    <div className={css.header}>
                        {backButton}
                        {languageSelector}
                    </div>

                    {advancedCustomizationBanner}

                    {sections.map((section) => (
                        <TranslateSection
                            key={section.title}
                            title={section.title}
                        >
                            {section.keys.map((key) => (
                                <TranslateInputRow
                                    key={`${language?.get('value')}-${key}`}
                                    keyName={key}
                                    value={
                                        get(textsOfSelectedLanguage, key) || ''
                                    }
                                    defaultValue={get(translations, key)}
                                    maxLength={
                                        section.formPropsValues[key].maxLength
                                    }
                                    isRequired={
                                        section.requiredKeys?.includes(key) ??
                                        false
                                    }
                                    saveValue={saveKeyValue}
                                />
                            ))}
                        </TranslateSection>
                    ))}
                </div>

                <TranslateUnsavedChangesModal
                    isOpen={isExitModalOpen}
                    description="Do you want to save your changes before leaving?"
                    onSave={onSaveValuesAndExit}
                    onDiscard={onDiscardChangesAndExit}
                    onClose={onCloseModals}
                />
                <TranslateUnsavedChangesModal
                    isOpen={isLanguageChangeModalOpen}
                    description="Do you want to save your changes before switching language?"
                    onSave={onSaveValuesAndSwitchLanguage}
                    onDiscard={onDiscardChangesAndSwitchLanguage}
                    onClose={onCloseModals}
                />
            </GorgiasChatRevampLayout>
        </>
    )
}
