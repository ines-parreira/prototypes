import React from 'react'

import {WorkflowVariable} from 'pages/automate/workflows/models/variables.types'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Modal from 'pages/common/components/modal/Modal'

import TestRequestResult from './TestRequestResult'

type Props = {
    isLoading: boolean
    isOpen: boolean
    onClose: () => void
    sendTestRequest: (variables?: Record<string, string>) => Promise<void>
    variables: HttpRequestNodeType['data']['variables']
    nodeId: string
    variablesInChildren: WorkflowVariable[]
    result: NonNullable<HttpRequestNodeType['data']['testRequestResult']>
    onChangeVariable: (
        index: number,
        variable: HttpRequestNodeType['data']['variables'][number]
    ) => void

    onDeleteVariable: (index: number) => void
    onAddVariable: () => void
}

const TestRequestModal = ({
    isLoading,
    isOpen,
    nodeId,
    onClose,
    sendTestRequest,
    variablesInChildren,
    variables,
    result,
    onChangeVariable,
    onDeleteVariable,
    onAddVariable,
}: Props) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="large" isScrollable>
            <TestRequestResult
                nodeId={nodeId}
                isLoading={isLoading}
                result={result}
                variables={variables}
                variablesInChildren={variablesInChildren}
                onRetest={sendTestRequest}
                onClose={onClose}
                onChangeVariable={onChangeVariable}
                onDeleteVariable={onDeleteVariable}
                onAddVariable={onAddVariable}
            />
        </Modal>
    )
}

export default TestRequestModal
