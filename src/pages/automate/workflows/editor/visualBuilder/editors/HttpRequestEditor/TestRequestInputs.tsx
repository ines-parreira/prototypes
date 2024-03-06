import React, {useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {WorkflowVariable} from 'pages/automate/workflows/models/variables.types'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import InputField from 'pages/common/forms/input/InputField'
import {toLiquidSyntax} from 'pages/automate/workflows/models/variables.model'

import css from './TestRequestInputs.less'

type Props = {
    isLoading: boolean
    inputs: WorkflowVariable[]
    onSendTestRequest: (values: Record<string, string>) => Promise<void>
    onClose: () => void
}

const TestRequestInputs = ({
    isLoading,
    inputs: inputsProp,
    onSendTestRequest,
    onClose,
}: Props) => {
    const [values, setValues] = useState<Record<string, string>>({})

    const inputs = inputsProp.map((input) => ({
        ...input,
        key: toLiquidSyntax({
            value: input.value,
            filter:
                input.type === 'date'
                    ? 'date'
                    : input.type === 'array'
                    ? 'json'
                    : undefined,
        }),
    }))
    const isDisabled = inputs.some((input) => !values[input.key])

    return (
        <>
            <ModalHeader title="Enter sample values to test request" />
            <ModalBody className={css.body}>
                {inputs.map((input) => (
                    <InputField
                        key={input.key}
                        label={input.name}
                        value={values[input.key]}
                        onChange={(value) => {
                            setValues({
                                ...values,
                                [input.key]: value,
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
                        void onSendTestRequest(values)
                    }}
                >
                    Continue
                </Button>
            </ModalActionsFooter>
        </>
    )
}

export default TestRequestInputs
