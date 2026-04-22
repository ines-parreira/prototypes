import { useEffect, useState } from 'react'

import { Controller, useFormContext } from 'react-hook-form'

import {
    Box,
    Button,
    Card,
    CardHeader,
    Heading,
    Link,
    Skeleton,
    StatusButton,
    Text,
    TextField,
} from '@gorgias/axiom'

type KlaviyoConnectionState = 'disconnected' | 'connected' | 'replacing'

const KLAVIYO_KEY_REGEX = /^pk_/

const maskApiKey = (key: string): string => {
    if (key.length <= 4) return key
    const lastFour = key.slice(-4)
    return '*'.repeat(key.length - 4) + lastFour
}

const CARD_DESCRIPTION = (
    <Text color="content-neutral-secondary">
        Insert your Klaviyo API key to use Klaviyo audiences.
        <br />
        Requires Private Custom API Key with Read Access to Lists, Profiles, and
        Segments.
    </Text>
)

export const KlaviyoCard = ({ isFormReady }: { isFormReady: boolean }) => {
    const { control, watch, setValue, resetField, trigger, formState } =
        useFormContext()
    const savedKey = watch('klaviyo_api_key') as string | null
    const isDirty = !!formState.dirtyFields.klaviyo_api_key

    const [connectionState, setConnectionState] =
        useState<KlaviyoConnectionState>('disconnected')

    useEffect(() => {
        if (!isFormReady || isDirty) return
        setConnectionState(savedKey ? 'connected' : 'disconnected')
    }, [isFormReady, isDirty, savedKey])

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton width={610} height={200} />
            </Box>
        )
    }

    const handleReplaceKey = () => {
        setValue('klaviyo_api_key', '', { shouldDirty: true })
        setConnectionState('replacing')
    }

    const handleCancelReplace = () => {
        resetField('klaviyo_api_key')
        setConnectionState('connected')
    }

    return (
        <Card gap="lg" width={610}>
            <CardHeader
                title={
                    <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                    >
                        <Heading size="md">Klaviyo</Heading>
                        {connectionState === 'connected' && (
                            <StatusButton color="green">Connected</StatusButton>
                        )}
                    </Box>
                }
                description={CARD_DESCRIPTION}
            />
            <Box flexDirection="column" gap="sm">
                <Controller
                    name="klaviyo_api_key"
                    control={control}
                    rules={{
                        validate: (value) => {
                            if (connectionState === 'connected') return true
                            if (connectionState === 'replacing' && !value)
                                return 'Please insert new API key and click Save.'
                            if (!value) return true
                            return (
                                KLAVIYO_KEY_REGEX.test(value) ||
                                'Incorrect API key format. It should start with pk_'
                            )
                        },
                    }}
                    render={({ field, fieldState }) => (
                        <TextField
                            label="Klaviyo API key"
                            type={
                                connectionState !== 'connected'
                                    ? 'password'
                                    : 'text'
                            }
                            value={
                                connectionState === 'connected' && field.value
                                    ? maskApiKey(field.value)
                                    : (field.value ?? '')
                            }
                            onChange={(value) => {
                                field.onChange(value)
                                void trigger('klaviyo_api_key')
                            }}
                            isDisabled={connectionState === 'connected'}
                            error={
                                connectionState !== 'connected'
                                    ? fieldState.error?.message
                                    : undefined
                            }
                            isInvalid={
                                connectionState !== 'connected' &&
                                Boolean(fieldState.error)
                            }
                        />
                    )}
                />
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Link
                        href="https://help.klaviyo.com/hc/en-us/articles/115005062267"
                        target="_blank"
                        rel="noopener noreferrer"
                        trailingSlot="external-link"
                    >
                        How to create Klaviyo API key
                    </Link>
                    {connectionState === 'connected' && (
                        <Button variant="secondary" onClick={handleReplaceKey}>
                            Replace key
                        </Button>
                    )}
                    {connectionState === 'replacing' && (
                        <Button
                            variant="secondary"
                            onClick={handleCancelReplace}
                        >
                            Cancel
                        </Button>
                    )}
                </Box>
            </Box>
        </Card>
    )
}
