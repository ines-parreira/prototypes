import {getGorgiasChatProtectedApiClient} from 'rest_api/gorgias_chat_protected_api/client'
import {
    Texts,
    Translations,
} from '../../../rest_api/gorgias_chat_protected_api/types'

export async function getTranslations(lang: string) {
    const client = await getGorgiasChatProtectedApiClient()
    const {data}: {data: Translations} = await client.getTranslations({
        lang,
    })
    return data
}

export async function getApplicationTexts(applicationId: string) {
    const client = await getGorgiasChatProtectedApiClient()
    const {data}: {data: Texts} = await client.getApplicationTexts({
        applicationId,
    })
    return data
}

export async function updateApplicationTexts(
    applicationId: string,
    texts: Texts
): Promise<void> {
    const client = await getGorgiasChatProtectedApiClient()

    await client.updateApplicationTexts(
        {
            applicationId,
        },
        {
            texts: texts.texts,
            sspTexts: texts.sspTexts,
        }
    )
}
