import { useCallback, useState } from 'react'

import writeText from 'copy-to-clipboard'

import useIsMounted from './useIsMounted'

export interface CopyToClipboardState {
    value?: string
    noUserInteraction?: boolean
    error?: Error
}

export default function useCopyToClipboard(): [
    CopyToClipboardState,
    (value: string) => void,
] {
    const isMounted = useIsMounted()
    const [state, setState] = useState<CopyToClipboardState>({
        noUserInteraction: true,
    })

    const copyToClipboard = useCallback(
        (value) => {
            if (!isMounted()) {
                return
            }
            let noUserInteraction
            let normalizedValue
            try {
                // only strings and numbers casted to strings can be copied to clipboard
                if (typeof value !== 'string' && typeof value !== 'number') {
                    const error = new Error(
                        `Cannot copy typeof ${typeof value} to clipboard, must be a string`,
                    )
                    if (process.env.NODE_ENV === 'development')
                        console.error(error)
                    setState({
                        value,
                        error,
                        noUserInteraction: true,
                    })
                    return
                }
                if (value === '') {
                    const error = new Error(
                        `Cannot copy empty string to clipboard.`,
                    )
                    if (process.env.NODE_ENV === 'development')
                        console.error(error)
                    setState({
                        value,
                        error,
                        noUserInteraction: true,
                    })
                    return
                }
                normalizedValue = value.toString()
                noUserInteraction = writeText(normalizedValue)
                setState({
                    value: normalizedValue,
                    error: undefined,
                    noUserInteraction,
                })
            } catch (error) {
                setState({
                    value: normalizedValue,
                    error: error as Error,
                    noUserInteraction,
                })
            }
        },
        [isMounted],
    )

    return [state, copyToClipboard]
}
