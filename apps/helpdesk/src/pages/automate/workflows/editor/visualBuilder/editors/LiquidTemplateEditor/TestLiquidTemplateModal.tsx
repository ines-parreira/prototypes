import React, { useState } from 'react'

import { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'
import { LiquidTemplateNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import InputField from 'pages/common/forms/input/InputField'

import useSendTestLiquidTemplate from './useSendTestLiquidTemplate'

import css from './TestLiquidTemplateModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    nodeInEdition: LiquidTemplateNodeType
    variables: WorkflowVariable[]
}

type TestResult = {
    success: boolean
    output?: string
    error?: string
}

const TestLiquidTemplateModal = ({
    isOpen,
    onClose,
    nodeInEdition,
    variables,
}: Props) => {
    const [values, setValues] = useState<Record<string, string>>({})
    const [result, setResult] = useState<TestResult | null>(null)

    const { isLoading, sendTestRequest } = useSendTestLiquidTemplate(
        nodeInEdition.data,
        (result) => setResult(result),
    )

    const isDisabled = variables.some(
        (variable) => variable && !values[variable.value],
    )

    const handleSubmit = async () => {
        await sendTestRequest(values)
    }

    const handleClose = () => {
        setValues({})
        setResult(null)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="large">
            <ModalHeader title="Test Liquid Template" />
            <ModalBody>
                <div className={css.container}>
                    {result ? (
                        <div>
                            {result.success ? (
                                <>
                                    <p className={css.successMessage}>
                                        ✓ Success
                                    </p>
                                    <pre className={css.successOutput}>
                                        {result.output || '(empty output)'}
                                    </pre>
                                </>
                            ) : (
                                <>
                                    <p className={css.errorTitle}>
                                        ✗ Template Error
                                    </p>
                                    <div className={css.errorContainer}>
                                        <pre className={css.errorContent}>
                                            {result.error ||
                                                'Unknown error occurred'}
                                        </pre>
                                    </div>
                                    <p className={css.errorHelpText}>
                                        Please check your template syntax and
                                        variable values.
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            {variables.filter(Boolean).length > 0 ? (
                                <>
                                    <p>
                                        Enter sample values for workflow
                                        variables:
                                    </p>
                                    {variables
                                        .filter(Boolean)
                                        .map((variable) => (
                                            <InputField
                                                key={variable.value}
                                                label={variable.name}
                                                value={
                                                    values[variable.value] || ''
                                                }
                                                onChange={(value) => {
                                                    setValues({
                                                        ...values,
                                                        [variable.value]: value,
                                                    })
                                                }}
                                                placeholder="Sample value"
                                            />
                                        ))}
                                </>
                            ) : (
                                <p className={css.noVariablesMessage}>
                                    No workflow variables found in the template.
                                </p>
                            )}
                        </>
                    )}
                </div>
            </ModalBody>
            <ModalActionsFooter>
                {result ? (
                    <>
                        <Button
                            intent="secondary"
                            onClick={() => setResult(null)}
                        >
                            Test Again
                        </Button>
                        <Button onClick={handleClose}>Close</Button>
                    </>
                ) : (
                    <>
                        <Button intent="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button
                            isLoading={isLoading}
                            isDisabled={
                                variables.filter(Boolean).length > 0 &&
                                isDisabled
                            }
                            onClick={handleSubmit}
                        >
                            Test
                        </Button>
                    </>
                )}
            </ModalActionsFooter>
        </Modal>
    )
}

export default TestLiquidTemplateModal
