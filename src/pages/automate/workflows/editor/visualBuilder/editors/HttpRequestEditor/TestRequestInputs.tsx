import React, { useState } from 'react'

import { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'
import Button from 'pages/common/components/button/Button'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import InputField from 'pages/common/forms/input/InputField'

import css from './TestRequestInputs.less'

type Props = {
    isLoading: boolean
    inputs: WorkflowVariable[]
    refreshTokenUrl?: string
    onSendTestRequest: (
        values: Record<string, string>,
        refreshToken?: string,
        refreshTokenUrl?: string,
    ) => Promise<void>
    onClose: () => void
}

const TestRequestInputs = ({
    isLoading,
    inputs,
    onSendTestRequest,
    onClose,
    refreshTokenUrl,
}: Props) => {
    const [refreshToken, setRefreshToken] = useState<string>('')
    const [values, setValues] = useState<Record<string, string>>({})

    const isDisabled = inputs.some((input) => !values[input.value])

    return (
        <>
            <ModalHeader
                title={`Enter ${refreshTokenUrl ? 'refresh token' : ''} 
                    ${refreshTokenUrl && inputs.length ? 'and' : ''} 
                    ${inputs.length ? 'sample values' : ''} to test request`}
            />
            <ModalBody className={css.body}>
                {refreshTokenUrl && (
                    <InputField
                        label={'Refresh Token'}
                        value={refreshToken}
                        onChange={(value) => {
                            setRefreshToken(value)
                        }}
                        placeholder="Sample refresh token"
                    />
                )}
                {inputs.map((input) => (
                    <InputField
                        key={input.value}
                        label={input.name}
                        value={values[input.value]}
                        onChange={(value) => {
                            setValues({
                                ...values,
                                [input.value]: value,
                            })
                        }}
                        placeholder="Sample value"
                    />
                ))}
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button
                    isLoading={isLoading}
                    isDisabled={isDisabled}
                    onClick={() => {
                        void onSendTestRequest(
                            values,
                            refreshToken,
                            refreshTokenUrl,
                        )
                    }}
                >
                    Continue
                </Button>
            </ModalActionsFooter>
        </>
    )
}

export default TestRequestInputs
