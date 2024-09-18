import React, {useCallback} from 'react'
import copy from 'copy-to-clipboard'

import {EmailIntegration} from 'models/integration/types'
import {getBaseEmailIntegration} from 'state/integrations/selectors'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export default function BaseEmailIntegrationInputField() {
    const baseIntegration: EmailIntegration = useAppSelector(
        getBaseEmailIntegration
    )?.toJS()

    const dispatch = useAppDispatch()
    const baseAddress = baseIntegration?.meta.address ?? ''

    const handleCopy = useCallback(() => {
        try {
            copy(baseAddress)
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    title: 'Address copied to clipboard',
                })
            )
        } catch (err: unknown) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    title: 'Failed to copy address',
                })
            )
        }

        copy(baseAddress)
    }, [baseAddress, dispatch])

    return (
        <InputGroup>
            <TextInput value={baseAddress} isDisabled />
            <Button intent="secondary" onClick={handleCopy}>
                <ButtonIconLabel icon="content_copy" position="right">
                    Copy
                </ButtonIconLabel>
            </Button>
        </InputGroup>
    )
}
