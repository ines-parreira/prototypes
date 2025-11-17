import type { AxiosError } from 'axios'

import { getLanguagesFromChatConfig } from 'config/integrations/gorgias_chat'
import type { LanguageChat } from 'constants/languages'
import type { GorgiasChatIntegration } from 'models/integration/types'
import type {
    HandoverCustomizationChatFallbackSettingsFormMultiLanguageValues,
    HandoverCustomizationChatFallbackSettingsFormValues,
} from 'pages/aiAgent/types'
import type {
    TextsMultiLanguage,
    TextsPerLanguage,
} from 'rest_api/gorgias_chat_protected_api/types'

const initialFormFieldValues: HandoverCustomizationChatFallbackSettingsFormValues =
    {
        fallbackMessage: '',
    }

/**
 * This object maps each field from the fallback settings form to its configuration.
 * it contains the friendly name of the field and validation constraints
 */
export const formFieldsConfiguration: Record<
    keyof HandoverCustomizationChatFallbackSettingsFormValues,
    {
        required: boolean
        friendlyName: string
        maxLength?: number
    }
> = {
    fallbackMessage: {
        friendlyName: 'Error message',
        required: false,
        maxLength: 255,
    },
}

/**
 * This object maps each field from the fallback settings form to its MultiLanguageText object.
 *
 * */
export const formFieldsLanguageReference: Record<
    keyof HandoverCustomizationChatFallbackSettingsFormValues,
    {
        type: keyof TextsPerLanguage
        fieldName: string
    }
> = {
    fallbackMessage: {
        type: 'texts',
        fieldName: 'aiAgentHandoverFallbackMessage',
    },
}

/**
 * This function parses the axios error message to a friendly error message,
 * converting the internal field name to a more user-friendly name
 * @param err - The axios error
 * @returns The friendly error message to be displayed to the user
 */
export const parseToFriendlyErrorMessage = (err: AxiosError) => {
    const axiosErrorMessage = (
        err as AxiosError<{ error: { message: string } }, any>
    )?.response?.data?.error?.message

    if (!axiosErrorMessage) {
        return 'Failed to save handover customization fallback settings'
    }

    let friendlyErrorMessage = axiosErrorMessage

    for (const key of Object.keys(formFieldsLanguageReference)) {
        const formFieldName =
            key as keyof HandoverCustomizationChatFallbackSettingsFormValues
        const fieldName = formFieldsLanguageReference[formFieldName].fieldName

        if (axiosErrorMessage.includes(fieldName)) {
            friendlyErrorMessage = friendlyErrorMessage.replace(
                fieldName,
                formFieldsConfiguration[formFieldName].friendlyName,
            )

            break
        }
    }

    return friendlyErrorMessage
}

/**
 * This function returns the initial form values for the fallback settings form for each language in the integration
 * @param integration - The integration metadata
 * @returns The initial form values
 */
export const getInitialFormValues = (integration: GorgiasChatIntegration) => {
    return getLanguagesFromChatConfig(integration.meta).reduce(
        (acc, language) => {
            acc[language] = { ...initialFormFieldValues }
            return acc
        },
        {} as HandoverCustomizationChatFallbackSettingsFormMultiLanguageValues,
    )
}

/**
 * This function maps the form values to the multilanguage texts, to be used to upsert the texts to the API
 * @param multiLanguageFormValues - The form values
 * @param currentMultiLanguageTexts - The current multilanguage texts
 * @returns The multilanguage texts
 */
export const mapFromFormValuesToMultiLanguageText = (
    multiLanguageFormValues: HandoverCustomizationChatFallbackSettingsFormMultiLanguageValues,
    currentMultiLanguageTexts: TextsMultiLanguage,
): TextsMultiLanguage => {
    const availableLanguagesInForm = Object.keys(multiLanguageFormValues)

    const updatedTexts: TextsMultiLanguage = { ...currentMultiLanguageTexts }

    for (const language of availableLanguagesInForm) {
        let langNewText: TextsPerLanguage

        const langFormValues = multiLanguageFormValues[language]

        let langCurrentText =
            currentMultiLanguageTexts[language as LanguageChat]

        if (langCurrentText) {
            langNewText = {
                ...langCurrentText,
            }
        } else {
            // If the language is not present in the current multi-language texts, we need to create a new one
            // with the empty values
            langNewText = {
                texts: {},
                sspTexts: {},
                meta: {},
            }
        }

        for (const key in langFormValues) {
            const fieldName =
                key as keyof HandoverCustomizationChatFallbackSettingsFormValues

            const formValue = langFormValues[fieldName]

            const fieldReference = formFieldsLanguageReference[fieldName]

            if (
                formValue === undefined ||
                formValue === null ||
                !fieldReference
            ) {
                continue
            }

            langNewText = {
                ...langNewText,
                [fieldReference.type]: {
                    ...langNewText[fieldReference.type],
                    [fieldReference.fieldName]: formValue,
                },
            }

            // If the form value is empty, we need to delete the field from the multilanguage text
            if (!formValue) {
                delete langNewText[fieldReference.type][
                    fieldReference.fieldName
                ]
            }
        }

        updatedTexts[language as LanguageChat] = { ...langNewText }
    }

    return updatedTexts
}

/**
 * This function maps the multilanguage texts to the form values, to be used to display the form values in the UI
 * this function is used when the data is fetched from the API and needs to be displayed in the UI
 * the integration is needed to generate the initial form values to avoid listing new languages with no text data
 * @param integration - The integration metadata
 * @param multiLanguageTexts - The multilanguage texts
 * @returns The form values
 */
export const mapFromMultiLanguageTextToFormValues = (
    integration: GorgiasChatIntegration,
    multiLanguageTexts: TextsMultiLanguage,
): HandoverCustomizationChatFallbackSettingsFormMultiLanguageValues => {
    let formValues: HandoverCustomizationChatFallbackSettingsFormMultiLanguageValues =
        getInitialFormValues(integration)

    const availableLanguages = Object.keys(multiLanguageTexts)

    const availableFields = Object.keys(formFieldsLanguageReference)

    for (const language of availableLanguages) {
        const textsPerLanguage = multiLanguageTexts[language as LanguageChat]

        for (const key of availableFields) {
            const fieldName =
                key as keyof HandoverCustomizationChatFallbackSettingsFormValues
            const fieldReference = formFieldsLanguageReference[fieldName]

            const textValue =
                textsPerLanguage[fieldReference.type][fieldReference.fieldName]

            if (textValue !== undefined && textValue !== null) {
                formValues = {
                    ...formValues,
                    [language]: {
                        ...formValues[language],
                        [fieldName]: textValue,
                    },
                }
            }
        }
    }

    return formValues
}
