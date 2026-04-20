import React, { useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import type { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'
import type { LiquidTemplateNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
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

    const handleSubmit = async () => {
        const valuesWithNulls: Record<string, string | null> = {}
        for (const variable of variables.filter(Boolean)) {
            const value = values[variable.value]
            valuesWithNulls[variable.value] = value || null
        }
        await sendTestRequest(valuesWithNulls)
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
                                    <p className={css.nullHelpText}>
                                        Leave empty to send as null
                                    </p>
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
                        <Button isLoading={isLoading} onClick={handleSubmit}>
                            Test
                        </Button>
                    </>
                )}
            </ModalActionsFooter>
        </Modal>
    )
}

export default TestLiquidTemplateModal
