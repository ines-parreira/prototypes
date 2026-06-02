import { useEffect, useMemo, useState } from 'react'

import { Link, useHistory, useParams } from 'react-router-dom'

import {
    Box,
    Breadcrumb,
    Breadcrumbs,
    Button,
    Heading,
    Icon,
    Skeleton,
    Text,
    TextField,
    toast,
} from '@gorgias/axiom'

import {
    useGetAppsByIds,
    useGetServiceConnection,
    useGetServiceConnectionAuth,
    useUpdateServiceConnection,
} from 'models/integration/queries'
import type {
    ServiceConnectionAuthLocation,
    ServiceConnectionAuthType,
    UpdateServiceConnectionAuthRequest,
    UpdateServiceConnectionRequest,
} from 'models/integration/types/serviceConnection'
import { deriveSingleValueLabel } from 'pages/aiAgent/actionsV2/apps/components'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

export type Props = {
    appId: string
}

type FormState = {
    name: string
    url: string
    tokenUrl: string
    clientId: string
    clientSecret: string
    tokenLocation: ServiceConnectionAuthLocation
    tokenKey: string
    scopes: string
}

function getValueLabel(
    authType: ServiceConnectionAuthType | undefined,
    key: string,
    scheme?: string | null,
): string {
    if (authType === 'oauth2') return 'Client secret'
    if (
        authType === 'api-key' ||
        authType === 'bearer-token' ||
        authType === 'custom-scheme'
    ) {
        return deriveSingleValueLabel(authType, key, scheme)
    }
    return 'Token value'
}

const EMPTY_FORM: FormState = {
    name: '',
    url: '',
    tokenUrl: '',
    clientId: '',
    clientSecret: '',
    tokenLocation: 'header',
    tokenKey: '',
    scopes: '',
}

export default function AppConnectionEdit() {
    const { appId, connectionId } = useParams<{
        appId: string
        connectionId: string
    }>()
    const history = useHistory()

    const appBaseURL = `/app/settings/integrations/app/${appId}`
    const credentialsURL = `${appBaseURL}/credentials`

    const { data: connection, isLoading: isLoadingConnection } =
        useGetServiceConnection(connectionId)
    const { data: auth, isLoading: isLoadingAuth } =
        useGetServiceConnectionAuth(connectionId)
    const { mutateAsync: updateConnection, isLoading: isSaving } =
        useUpdateServiceConnection(appId)

    const [appQuery] = useGetAppsByIds(appId ? [appId] : [])
    const appTitle = appQuery?.data?.name ?? ''

    const initialForm = useMemo<FormState>(() => {
        if (!connection || !auth) return EMPTY_FORM
        return {
            name: connection.name,
            url: connection.url,
            tokenUrl: '',
            clientId: '',
            clientSecret: auth.value ?? '',
            tokenLocation: auth.location,
            tokenKey: auth.key,
            scopes: '',
        }
    }, [connection, auth])

    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        setForm(initialForm)
        setIsDirty(false)
    }, [initialForm])

    function updateField<K extends keyof FormState>(
        field: K,
        value: FormState[K],
    ) {
        setForm((prev) => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const isLoading = isLoadingConnection || isLoadingAuth
    const isOAuth2 = auth?.type === 'oauth2'
    const valueLabel = getValueLabel(auth?.type, auth?.key ?? '', auth?.scheme)

    async function handleSave() {
        if (!auth || !connection) return

        const clientSecretChanged =
            form.clientSecret !== initialForm.clientSecret
        const hasAuthChanges = isOAuth2
            ? Boolean(
                  form.tokenUrl ||
                  form.clientId ||
                  form.scopes ||
                  clientSecretChanged,
              )
            : clientSecretChanged

        const payload: UpdateServiceConnectionRequest = {
            name: form.name,
            url: form.url,
        }

        if (hasAuthChanges) {
            const authPayload: UpdateServiceConnectionAuthRequest = {
                type: auth.type,
                location: form.tokenLocation,
                key: form.tokenKey,
            }

            if (isOAuth2) {
                if (form.tokenUrl) authPayload.token_url = form.tokenUrl
                if (form.clientId) authPayload.client_id = form.clientId
                if (form.clientSecret)
                    authPayload.client_secret = form.clientSecret
                if (form.scopes) authPayload.scopes = form.scopes
            } else if (form.clientSecret) {
                authPayload.value = form.clientSecret
            }

            if (auth.type === 'custom-scheme' && auth.scheme) {
                authPayload.scheme = auth.scheme
            }

            payload.auth = authPayload
        }

        try {
            await updateConnection({
                connectionId,
                payload,
            })
            setIsDirty(false)
            toast.success('Credentials updated')
            history.push(credentialsURL)
        } catch {
            toast.error(
                "Couldn't update credentials. Check that they're correct and try again.",
            )
        }
    }

    if (isLoading || !connection) {
        return (
            <Box flexDirection="column" gap="md" padding="lg">
                <Skeleton height="40px" />
                <Skeleton height="240px" />
            </Box>
        )
    }

    const breadcrumbAppLabel = appTitle || connection.name

    return (
        <div className="full-width">
            <UnsavedChangesPrompt
                when={isDirty}
                onSave={handleSave}
                shouldRedirectAfterSave
            />
            <Box
                flexDirection="column"
                gap="sm"
                paddingTop="md"
                paddingBottom="md"
                paddingLeft="lg"
                paddingRight="lg"
            >
                <Breadcrumbs>
                    <Breadcrumb>
                        <Link to="/app/settings/integrations">Apps</Link>
                    </Breadcrumb>
                    <Breadcrumb>
                        <Link to={appBaseURL}>{breadcrumbAppLabel}</Link>
                    </Breadcrumb>
                    <Breadcrumb>
                        <Link to={credentialsURL}>Credentials</Link>
                    </Breadcrumb>
                </Breadcrumbs>

                <Box
                    alignItems="center"
                    justifyContent="space-between"
                    gap="md"
                >
                    <Box alignItems="center" gap="sm">
                        <Button
                            size="sm"
                            variant="secondary"
                            aria-label="Back to credentials"
                            icon={<Icon name="arrow-left" />}
                            onClick={() => history.push(credentialsURL)}
                        />
                        <Heading size="lg">
                            {form.name || connection.name}
                        </Heading>
                    </Box>
                    <Button
                        isDisabled={
                            !isDirty ||
                            isSaving ||
                            !form.name ||
                            !form.clientSecret
                        }
                        isLoading={isSaving}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </Box>
            </Box>

            <Box flexDirection="column" gap="lg" padding="lg">
                <Text>
                    Manage your credentials to sync data and run actions.
                </Text>

                <Box flexDirection="column" gap="md" w="480px">
                    <TextField
                        label="Name"
                        isRequired
                        value={form.name}
                        onChange={(value) => updateField('name', value)}
                    />
                    {isOAuth2 && (
                        <>
                            <TextField
                                label="Token URL"
                                value={form.tokenUrl}
                                onChange={(value) =>
                                    updateField('tokenUrl', value)
                                }
                                caption="The OAuth token endpoint. Leave empty to keep the existing value."
                            />
                            <TextField
                                label="Client ID"
                                value={form.clientId}
                                onChange={(value) =>
                                    updateField('clientId', value)
                                }
                                caption="Leave empty to keep the existing value."
                            />
                        </>
                    )}
                    <TextField
                        label={valueLabel}
                        type="password"
                        isRequired
                        value={form.clientSecret}
                        onChange={(value) => updateField('clientSecret', value)}
                    />
                    {isOAuth2 && (
                        <TextField
                            label="Scopes"
                            value={form.scopes}
                            onChange={(value) => updateField('scopes', value)}
                        />
                    )}
                </Box>
            </Box>
        </div>
    )
}
