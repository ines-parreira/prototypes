import React, {useState} from 'react'

import {WorkflowVariable} from 'pages/automate/workflows/models/variables.types'
import Button from 'pages/common/components/button/Button'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import InputField from 'pages/common/forms/input/InputField'

import css from './TestRequestInputs.less'

type Props = {
    isLoading: boolean
    inputs: WorkflowVariable[]
    onSendTestRequest: (values: Record<string, string>) => Promise<void>
    onClose: () => void
}

const TestRequestInputs = ({
    isLoading,
    inputs,
    onSendTestRequest,
    onClose,
}: Props) => {
    const [values, setValues] = useState<Record<string, string>>({})

    const isDisabled = inputs.some((input) => !values[input.value])

    return (
        <>
            <ModalHeader title="Enter sample values to test request" />
            <ModalBody className={css.body}>
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
