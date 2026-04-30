import React, { useCallback } from 'react'

import copy from 'copy-to-clipboard'
import { isEmpty } from 'lodash'

import {
    LegacyButton as Button,
    LegacyLabel as Label,
    toast,
} from '@gorgias/axiom'

import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'

type Props = {
    label?: string
}

export default function BaseEmailIntegrationInputField({ label }: Props) {
    const baseAddress =
        window.GORGIAS_STATE?.integrations?.authentication?.email
            ?.forwarding_email_address ?? ''

    const handleCopy = useCallback(() => {
        try {
            copy(baseAddress)
            toast.success('Address copied to clipboard')
        } catch {
            toast.error('Failed to copy address')
        }

        copy(baseAddress)
    }, [baseAddress])

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
