import React from 'react'

import Modal from 'pages/common/components/modal/Modal'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import TestRequestResult from './TestRequestResult'

type Props = {
    isLoading: boolean
    isOpen: boolean
    onClose: () => void
    sendTestRequest: (variables?: Record<string, string>) => Promise<void>
    variables: HttpRequestNodeType['data']['variables']
    result: NonNullable<HttpRequestNodeType['data']['testRequestResult']>
}

const TestRequestModal = ({
    isLoading,
    isOpen,
    onClose,
    sendTestRequest,
    variables,
    result,
}: Props) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <TestRequestResult
                isLoading={isLoading}
                result={result}
                variables={variables}
                onRetest={sendTestRequest}
            />
        </Modal>
    )
}

export default TestRequestModal
