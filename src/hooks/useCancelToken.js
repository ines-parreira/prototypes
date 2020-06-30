// @flow
//$FlowFixMe
import {useEffect} from 'react'
import axios, {CancelToken, type CancelTokenSource} from 'axios'

const useCancelToken = (
    makeRequest: (source: CancelTokenSource) => Promise<*>,
    inputs: any[]
) => {
    const requestHandler = async (source: CancelTokenSource) => {
        try {
            await makeRequest(source)
        } catch (error) {
            if (!axios.isCancel(error)) {
                throw error
            }
        }
    }
    useEffect(() => {
        const source = CancelToken.source()
        requestHandler(source)
        return () => source.cancel()
    }, inputs)
}

export default useCancelToken
