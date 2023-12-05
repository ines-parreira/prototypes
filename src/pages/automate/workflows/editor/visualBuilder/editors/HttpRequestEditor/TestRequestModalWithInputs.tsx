import React from 'react'

import Modal from 'pages/common/components/modal/Modal'
import {WorkflowVariable} from 'pages/automate/workflows/models/variables.types'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import TestRequestResult from './TestRequestResult'
import TestRequestInputs from './TestRequestInputs'

type Props = {
    isLoading: boolean
    isOpen: boolean
    onClose: () => void
    sendTestRequest: (variables?: Record<string, string>) => Promise<void>
    onReset: () => void
    variables: HttpRequestNodeType['data']['variables']
    result: HttpRequestNodeType['data']['testRequestResult']
    inputs: WorkflowVariable[]
}

const TestRequestModalWithInputs = ({
    isLoading,
    isOpen,
    onClose,
    sendTestRequest,
    onReset,
    variables,
    result,
    inputs,
}: Props) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {result ? (
                <TestRequestResult
                    result={result}
                    variables={variables}
                    onRetest={onReset}
                />
            ) : (
                <TestRequestInputs
                    isLoading={isLoading}
                    inputs={inputs}
                    onSendTestRequest={sendTestRequest}
                />
            )}
        </Modal>
    )
}

export default TestRequestModalWithInputs
