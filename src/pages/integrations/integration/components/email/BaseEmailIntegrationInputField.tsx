import React, { useCallback } from 'react'

import copy from 'copy-to-clipboard'
import { isEmpty } from 'lodash'

import { Label } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type Props = {
    label?: string
}

export default function BaseEmailIntegrationInputField({ label }: Props) {
    const dispatch = useAppDispatch()
    const baseAddress =
        window.GORGIAS_STATE?.integrations?.authentication?.email
            ?.forwarding_email_address ?? ''

    const handleCopy = useCallback(() => {
        try {
            copy(baseAddress)
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    title: 'Address copied to clipboard',
                }),
            )
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    title: 'Failed to copy address',
                }),
            )
        }

        copy(baseAddress)
    }, [baseAddress, dispatch])

    if (isEmpty(baseAddress)) {
        return null
    }

    return (
        <>
            {label && <Label>{label}</Label>}
            <InputGroup>
                <TextInput value={baseAddress} isDisabled />
                <Button
                    intent="secondary"
                    onClick={handleCopy}
                    trailingIcon="content_copy"
                >
                    Copy
                </Button>
            </InputGroup>
        </>
    )
}
