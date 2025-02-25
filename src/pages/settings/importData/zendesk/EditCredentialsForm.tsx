import React, { FormEvent, useState } from 'react'

import classNames from 'classnames'
import { fromJS } from 'immutable'
import { Form } from 'reactstrap'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ZendeskIntegration } from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import InputField from 'pages/common/forms/input/InputField'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getAreIntegrationsLoading } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { ImportStatus, ZENDESK_CONNECTION_TYPE } from './types'

import css from './EditCredentialsForm.less'

type Props = {
    integration: ZendeskIntegration
}

export default function EditCredentialsForm({ integration }: Props) {
    const [apiKey, setApiKey] = useState('')
    const [email, setEmail] = useState('')

    const areIntegrationsLoading = useAppSelector(getAreIntegrationsLoading)

    const dispatch = useAppDispatch()

    const shouldUpdateCredentials = apiKey || email
    const areBothFieldsFilled = apiKey && email

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault()

        /* if only one of the fields is updated, prevent update */
        if (shouldUpdateCredentials && !areBothFieldsFilled) {
            void dispatch(
                notify({
                    message: apiKey
                        ? 'Please enter email address'
                        : 'Please enter API key',
                    status: NotificationStatus.Error,
                }),
            )

            return
        }

        void dispatch(
            updateOrCreateIntegration(
                fromJS({
                    id: integration.id,
                    meta: {
                        status: ImportStatus.Pending,
                    },
                    ...(shouldUpdateCredentials && {
                        connections: [
                            {
                                type: ZENDESK_CONNECTION_TYPE,
                                data: {
                                    domain: integration.name,
                                    api_key: apiKey,
                                    email: email,
                                },
                            },
                        ],
                    }),
                }),
            ),
        )
    }

    const isFailedImport = integration.meta.status === ImportStatus.Failure

    return (
        <Form onSubmit={handleSubmit}>
            <DEPRECATED_InputField
                readOnly
                type="text"
                name="integration"
                value={integration.name}
                label="Account name"
                rightAddon=".zendesk.com"
                disabled
                className="mb-3"
            />
            {isFailedImport && (
                <>
                    <InputField
                        type="text"
                        name="email"
                        label="Login email"
                        placeholder={apiKey ? '' : '•••••••••••••••'}
                        onChange={(value: string) => setEmail(value)}
                        value={email}
                        className={classNames(css.inputField, 'mb-3')}
                    />
                    <InputField
                        className={classNames(css.inputField, 'mb-4')}
                        type="text"
                        name="apiKey"
                        value={apiKey}
                        label={
                            <span>
                                API Key{' '}
                                <i className="material-icons" id="api-key-info">
                                    info_outline
                                </i>
                            </span>
                        }
                        placeholder={
                            email ? '' : '•••••••••••••••••••••••••••••••'
                        }
                        onChange={(value: string) => setApiKey(value)}
                    />

                    <Tooltip placement="top-start" target="api-key-info">
                        {`In Zendesk, go to Settings / Channels / API, create a
                        new token named "Gorgias Import", and copy/paste it
                        here.`}
                    </Tooltip>

                    <Button
                        type="submit"
                        className="mb-4"
                        isLoading={areIntegrationsLoading}
                    >
                        Restart import
                    </Button>
                </>
            )}
        </Form>
    )
}
