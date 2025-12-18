import { Box, TextField } from '@gorgias/axiom'

import type { ZendeskImportFormProps } from './types'

import css from './ZendeskImportForm.less'

export const ZendeskImportForm = ({
    formState,
    formErrors,
    formActions,
    onSubmit,
}: ZendeskImportFormProps) => {
    return (
        <form onSubmit={onSubmit}>
            <Box flexDirection="column" gap="lg">
                <Box>
                    <TextField
                        label="Zendesk subdomain"
                        placeholder="acme"
                        value={formState.subdomain}
                        id="subdomain"
                        onChange={formActions.setSubdomain}
                        isRequired
                    />
                    <Box className={css.subDomain}>.zendesk.com</Box>
                </Box>
                <TextField
                    label="Login email"
                    placeholder="support@yourcompany.com"
                    value={formState.loginEmail}
                    id="loginEmail"
                    caption="Add the email address used to login to your Zendesk account."
                    onChange={formActions.setLoginEmail}
                    error={formErrors.emailError}
                    isRequired
                />

                <TextField
                    label="API key"
                    placeholder="API key"
                    value={formState.apiKey}
                    id="zendeskApiKey"
                    caption='In Zendesk, go to Settings > Channels > API. Create a new token called "Gorgias Import", then add it into the field above.'
                    onChange={formActions.setApiKey}
                    isRequired
                />
            </Box>
        </form>
    )
}
