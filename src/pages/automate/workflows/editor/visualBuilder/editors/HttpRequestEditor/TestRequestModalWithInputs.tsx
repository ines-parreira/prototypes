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
    variablesInChildren: WorkflowVariable[]
    nodeId: string
    onChangeVariable: (
        index: number,
        variable: HttpRequestNodeType['data']['variables'][number]
    ) => void
    onDeleteVariable: (index: number) => void
    onAddVariable: () => void
}

const TestRequestModalWithInputs = ({
    isLoading,
    isOpen,
    nodeId,
    onClose,
    sendTestRequest,
    onReset,
    variables,
    variablesInChildren,
    result,
    inputs,
    onChangeVariable,
    onDeleteVariable,
    onAddVariable,
}: Props) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="large" isScrollable>
            {result ? (
                <TestRequestResult
                    nodeId={nodeId}
                    result={result}
                    variables={variables}
                    variablesInChildren={variablesInChildren}
                    onRetest={onReset}
                    onClose={onClose}
                    onChangeVariable={onChangeVariable}
                    onDeleteVariable={onDeleteVariable}
                    onAddVariable={onAddVariable}
                />
            ) : (
                <TestRequestInputs
                    isLoading={isLoading}
                    inputs={inputs}
                    onSendTestRequest={sendTestRequest}
                    onClose={onClose}
                />
            )}
        </Modal>
    )
}

export default TestRequestModalWithInputs
