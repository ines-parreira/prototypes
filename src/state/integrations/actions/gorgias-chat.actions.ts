import {getGorgiasChatProtectedApiClient} from 'rest_api/gorgias_chat_protected_api/client'
import {
    GetInstallationSnippetParams,
    GetInstallationSnippetResponse,
} from 'models/integration/types'
import {
    Texts,
    Translations,
    InstallationStatus,
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

export async function getInstallationStatus(applicationId: string) {
    const client = await getGorgiasChatProtectedApiClient()
    const {data}: {data: InstallationStatus} =
        await client.getInstallationStatus({
            applicationId,
        })
    return data
}

export async function getInstallationSnippet(
    params: GetInstallationSnippetParams
) {
    const client = await getGorgiasChatProtectedApiClient()
    const {data}: {data: GetInstallationSnippetResponse} =
        await client.getInstallationSnippet(params)
    return data
}
