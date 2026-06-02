import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'

import { sanitizeHtmlDefault } from '@repo/utils'

import {
    Box,
    Button,
    Heading,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
    TextField,
} from '@gorgias/axiom'

import type { OutboundAuth } from 'models/integration/types/app'

export interface ConnectAppAuthModalApp {
    name: string
    iconUrl?: string
}

export type ConnectAppAuthCredentials =
    | { value: string }
    | { username: string; password: string }

type SingleValueAuthType = 'api-key' | 'bearer-token' | 'custom-scheme'

interface ConnectAppAuthModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    app: ConnectAppAuthModalApp
    outboundAuth: OutboundAuth | null
    onSubmit: (credentials: ConnectAppAuthCredentials) => void | Promise<void>
    isSubmitting?: boolean
}

const SINGLE_VALUE_FALLBACK_LABEL: Record<SingleValueAuthType, string> = {
    'api-key': 'API key',
    'bearer-token': 'Bearer token',
    'custom-scheme': 'Secret',
}

export const deriveSingleValueLabel = (
    authType: SingleValueAuthType,
    key: string,
    scheme?: string | null,
) => {
    if (!key) return scheme || SINGLE_VALUE_FALLBACK_LABEL[authType]
    if (/^x-api-key$/i.test(key)) return 'API key'
    if (/^authorization$/i.test(key))
        return scheme || SINGLE_VALUE_FALLBACK_LABEL[authType]
    return key
}

export const ConnectAppAuthModal = ({
    isOpen,
    onOpenChange,
    app,
    outboundAuth,
    onSubmit,
    isSubmitting = false,
}: ConnectAppAuthModalProps) => {
    const [value, setValue] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setValue('')
            setUsername('')
            setPassword('')
        }
    }, [isOpen])

    const authType = outboundAuth?.type
    const isBasic = authType === 'basic'

    const hasCredentials = isBasic
        ? username.trim().length > 0 && password.trim().length > 0
        : value.trim().length > 0

    const canSubmit = !!outboundAuth && !isSubmitting && hasCredentials

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        if (!canSubmit) return
        if (isBasic) {
            await onSubmit({ username, password })
        } else {
            await onSubmit({ value })
        }
    }

    const renderInputs = () => {
        if (!outboundAuth) {
            return (
                <Text color="content-neutral-secondary">
                    Connection details are not available for this app yet.
                </Text>
            )
        }

        if (isBasic) {
            return (
                <>
                    <TextField
                        label="Username"
                        value={username}
                        onChange={setUsername}
                        isRequired
                        isDisabled={isSubmitting}
                        aria-label="Username"
                    />
                    <TextField
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        isRequired
                        isDisabled={isSubmitting}
                        aria-label="Password"
                    />
                </>
            )
        }

        const singleValueType = authType as SingleValueAuthType
        const label = deriveSingleValueLabel(
            singleValueType,
            outboundAuth.key,
            outboundAuth.scheme,
        )

        return (
            <TextField
                label={label}
                value={value}
                onChange={setValue}
                isRequired
                isDisabled={isSubmitting}
                aria-label={label}
            />
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="sm"
            isDismissable={!isSubmitting}
        >
            <OverlayHeader
                title={
                    <Box alignItems="center" gap="sm">
                        {app.iconUrl && (
                            <img
                                src={app.iconUrl}
                                alt=""
                                width={24}
                                height={24}
                            />
                        )}
                        <Heading size="lg">Connect {app.name}</Heading>
                    </Box>
                }
            />
            <OverlayContent display="block">
                <form
                    onSubmit={handleSubmit}
                    aria-label={`Connect ${app.name}`}
                >
                    <Box flexDirection="column" gap="md">
                        <Text>
                            Provide your credentials to connect {app.name} to
                            your account.
                        </Text>
                        {outboundAuth?.setup_description && (
                            <Text color="content-neutral-secondary">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHtmlDefault(
                                            outboundAuth.setup_description,
                                        ),
                                    }}
                                />
                            </Text>
                        )}
                        {renderInputs()}
                    </Box>
                </form>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="sm" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={() => onOpenChange(false)}
                        isDisabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isDisabled={!canSubmit}
                        isLoading={isSubmitting}
                    >
                        Connect
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
