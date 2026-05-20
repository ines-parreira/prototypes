import { useEffect, useMemo, useState } from 'react'

import { Link, useHistory, useParams } from 'react-router-dom'

import {
    Box,
    Breadcrumb,
    Breadcrumbs,
    Button,
    Heading,
    Icon,
    ListItem,
    SelectField,
    Skeleton,
    Text,
    TextField,
    toast,
} from '@gorgias/axiom'

import { isGorgiasApiError } from 'models/api/types'
import {
    useGetServiceConnection,
    useGetServiceConnectionAuth,
    useUpdateServiceConnection,
} from 'models/integration/queries'
import type {
    ServiceConnectionAuthLocation,
    UpdateServiceConnectionAuthRequest,
} from 'models/integration/types/serviceConnection'

export type Props = {
    appId: string
}

type TokenLocation = { id: ServiceConnectionAuthLocation; name: string }
const TOKEN_LOCATIONS: TokenLocation[] = [
    { id: 'header', name: 'header' },
    { id: 'query', name: 'query' },
]

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
    const connectionsURL = `${appBaseURL}/connections`

    const { data: connection, isLoading: isLoadingConnection } =
        useGetServiceConnection(connectionId)
    const { data: auth, isLoading: isLoadingAuth } =
        useGetServiceConnectionAuth(connectionId)
    const { mutateAsync: updateConnection, isLoading: isSaving } =
        useUpdateServiceConnection()

    const initialForm = useMemo<FormState>(() => {
        if (!connection || !auth) return EMPTY_FORM
        const isOAuth2 = auth.type === 'oauth2'
        return {
            name: connection.name,
            url: connection.url,
            tokenUrl: isOAuth2 ? '' : '',
            clientId: '',
            clientSecret: '',
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

    async function handleSave() {
        if (!auth || !connection) return

        const authPayload: UpdateServiceConnectionAuthRequest = {
            type: auth.type,
            location: form.tokenLocation,
            key: form.tokenKey,
        }

        if (isOAuth2) {
            if (form.tokenUrl) authPayload.token_url = form.tokenUrl
            if (form.clientId) authPayload.client_id = form.clientId
            if (form.clientSecret) authPayload.client_secret = form.clientSecret
            if (form.scopes) authPayload.scopes = form.scopes
        } else if (form.clientSecret) {
            authPayload.value = form.clientSecret
        }

        try {
            await updateConnection({
                connectionId,
                payload: {
                    name: form.name,
                    url: form.url,
                    auth: authPayload,
                },
            })
            toast.success(`Saved ${form.name}.`)
            setIsDirty(false)
        } catch (error) {
            toast.error(
                isGorgiasApiError(error)
                    ? error.response.data.error.msg
                    : 'Failed to save the connection.',
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

    return (
        <div className="full-width">
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
                        <Link to={appBaseURL}>{connection.service}</Link>
                    </Breadcrumb>
                    <Breadcrumb>
                        <Link to={connectionsURL}>Connections</Link>
                    </Breadcrumb>
                </Breadcrumbs>

                <Box
                    alignItems="center"
                    justifyContent="space-between"
                    gap="md"
                >
                    <Box alignItems="center" gap="sm">
                        <Button
                            variant="secondary"
                            aria-label="Back to connections"
                            icon={<Icon name="arrow-left" />}
                            onClick={() => history.push(connectionsURL)}
                        />
                        <Heading size="lg">
                            {form.name || connection.name}
                        </Heading>
                    </Box>
                    <Button
                        isDisabled={!isDirty || isSaving}
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
                    <TextField
                        label="URL"
                        isRequired
                        value={form.url}
                        onChange={(value) => updateField('url', value)}
                        caption="The base URL of the external API."
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
                        label={isOAuth2 ? 'Client secret' : 'Token value'}
                        type="password"
                        value={form.clientSecret}
                        onChange={(value) => updateField('clientSecret', value)}
                        caption="Leave empty to keep the existing value."
                    />
                    <SelectField
                        label="Token location"
                        isRequired
                        items={TOKEN_LOCATIONS}
                        value={TOKEN_LOCATIONS.find(
                            (loc) => loc.id === form.tokenLocation,
                        )}
                        onChange={(selection) => {
                            if (selection) {
                                updateField('tokenLocation', selection.id)
                            }
                        }}
                        placeholder="header"
                    >
                        {(option) => (
                            <ListItem id={option.id} label={option.name} />
                        )}
                    </SelectField>
                    <TextField
                        label="Token key"
                        isRequired
                        value={form.tokenKey}
                        onChange={(value) => updateField('tokenKey', value)}
                        caption="Key used to authenticate API requests."
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
