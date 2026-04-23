import type {
    GetApplicationsResponse,
    GetInstallationSnippetParams,
    GetInstallationSnippetResponse,
} from 'models/integration/types'
import {
    getGorgiasChatApiBaseUrl,
    getGorgiasChatProtectedApiClient,
} from 'rest_api/gorgias_chat_protected_api/client'
import type {
    InstallationStatus,
    InstallationStatuses,
    Texts,
    Translations,
} from 'rest_api/gorgias_chat_protected_api/types'

export async function getTranslations(lang: string) {
    const client = await getGorgiasChatProtectedApiClient()
    const { data }: { data: Translations } = await client.getTranslations({
        lang,
    })
    return data
}

export async function getApplicationTexts(applicationId: string) {
    const client = await getGorgiasChatProtectedApiClient()
    const { data }: { data: Texts } = await client.getApplicationTexts({
        applicationId,
    })
    return data
}

export async function updateApplicationTexts(
    applicationId: string,
    texts: Texts,
): Promise<void> {
    const client = await getGorgiasChatProtectedApiClient()

    await client.updateApplicationTexts(
        {
            applicationId,
        },
        texts,
    )
}

export async function getInstallationStatus(applicationId: string) {
    const client = await getGorgiasChatProtectedApiClient()
    const { data }: { data: InstallationStatus } =
        await client.getInstallationStatus({
            applicationId,
        })
    return data
}

export async function getInstallationStatuses() {
    const client = await getGorgiasChatProtectedApiClient()
    const { data }: { data: InstallationStatuses } =
        await client.getInstallationStatuses({})
    return data
}

export async function getInstallationSnippet(
    params: GetInstallationSnippetParams,
) {
    const client = await getGorgiasChatProtectedApiClient()
    const { data }: { data: GetInstallationSnippetResponse } =
        await client.getInstallationSnippet(params)
    return data
}

export async function getPreviewInstallationSnippet(): Promise<GetInstallationSnippetResponse> {
    const baseUrl = getGorgiasChatApiBaseUrl()
    const scriptSrc = `${baseUrl}/bundle-loader/preview`

    return {
        snippet: `<script id="gorgias-chat-widget-install-v3" src="${scriptSrc}"></script>`,
        snippetVersion:
            'v3' as GetInstallationSnippetResponse['snippetVersion'],
        appKey: 'preview',
    }
}

export async function getApplications() {
    const client = await getGorgiasChatProtectedApiClient()
    const { data }: { data: GetApplicationsResponse } =
        await client.getApplications()
    return data
}
