import { Box, LegacyTextField as TextField } from '@gorgias/axiom'

import CopyButton from 'components/CopyButton/CopyButton'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'

import { useAccessManagementForm } from '../hooks'
import type { ModalMode } from '../types'

import css from '../CustomProviderSso.less'

type AccessManagementFormProps = {
    callbackUrl: string
    clientId: string
    clientSecret?: string
    metadataUrl: string
    mode: ModalMode
    onValidationChange?: (isValid: boolean) => void
    providerName: string
    setClientId: (value: string) => void
    setMetadataUrl: (value: string) => void
    setName: (value: string) => void
    setClientSecret: (value: string) => void
}

export const AccessManagementForm = ({
    callbackUrl,
    clientId,
    clientSecret,
    setClientSecret,
    metadataUrl,
    mode,
    onValidationChange,
    providerName,
    setClientId,
    setMetadataUrl,
    setName,
}: AccessManagementFormProps) => {
    const { fieldErrors, markFieldAsTouched } = useAccessManagementForm({
        clientId,
        clientSecret,
        metadataUrl,
        mode,
        onValidationChange,
        providerName,
    })

    return (
        <>
            <div className={css.setupInstructions}>
                <Box className={css.instructionsSection}>
                    <h2 className={css.setupInstructionsTitle}>
                        Setup instructions
                    </h2>
                </Box>
                <Box className={css.instructionsSection}>
                    <ol className={css.instructionsList}>
                        <li>
                            Create an OAuth application of type &quot;Web
                            Application&quot; for Gorgias within your identity
                            provider
                        </li>
                        <li>
                            Configure the URL shown below as allowed redirect
                            URI for the application
                        </li>
                        <li>
                            Take note of the app&apos;s client ID and secret,
                            then paste them below
                        </li>
                    </ol>
                </Box>

                <p className={css.callbackUrlLabel}>Callback URL</p>

                <div className={css.callbackUrlContainer}>
                    <InputGroup>
                        <TextInput value={callbackUrl} isDisabled isResizable />
                        <CopyButton
                            value={callbackUrl}
                            onCopyMessage="Callback URL copied to clipboard"
                        />
                    </InputGroup>
                </div>
            </div>

            <form>
                <Box className={css.formRow}>
                    <Box className={css.formColumn}>
                        <Box className={css.fieldContainer}>
                            <TextField
                                caption="URL-safe identifier (letters, numbers, hyphens, underscores)"
                                error={fieldErrors.providerName}
                                id="providerName"
                                isRequired={true}
                                label="Provider name"
                                onBlur={() =>
                                    markFieldAsTouched('providerName')
                                }
                                onChange={setName}
                                placeholder="e.g. Okta, OneLogin, OneAll"
                                type="text"
                                value={providerName}
                                className={css.providerNameClientInput}
                            />
                        </Box>
                    </Box>

                    <Box className={css.formColumn}>
                        <Box className={css.fieldContainer}>
                            <TextField
                                error={fieldErrors.clientId}
                                id="clientId"
                                isRequired={true}
                                label="Client ID"
                                onBlur={() => markFieldAsTouched('clientId')}
                                onChange={setClientId}
                                placeholder="Application client ID"
                                type="text"
                                value={clientId}
                                className={css.providerNameClientInput}
                            />
                        </Box>
                    </Box>
                </Box>

                <Box className={css.fieldContainer}>
                    <TextField
                        error={fieldErrors.clientSecret}
                        id="clientSecret"
                        isRequired={mode === 'create'}
                        label="Client secret"
                        onBlur={() => markFieldAsTouched('clientSecret')}
                        onChange={setClientSecret}
                        placeholder={
                            mode === 'edit'
                                ? '••••••••'
                                : 'Application client secret'
                        }
                        type="password"
                        value={clientSecret}
                    />
                </Box>

                <Box className={css.fieldContainer}>
                    <TextField
                        caption="Where the provider's OpenID Connect configuration (`/.well-known/openid-configuration`) can be found"
                        error={fieldErrors.metadataUrl}
                        id="metadataUrl"
                        isRequired={true}
                        label="Provider URL"
                        onBlur={() => markFieldAsTouched('metadataUrl')}
                        onChange={setMetadataUrl}
                        placeholder="e.g. your-domain.okta.com, your-domain.onelogin.com/oidc/2"
                        type="url"
                        value={metadataUrl}
                    />
                </Box>
            </form>
        </>
    )
}
