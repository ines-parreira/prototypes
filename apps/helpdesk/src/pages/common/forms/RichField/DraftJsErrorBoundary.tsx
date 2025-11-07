import React, { Component, ReactNode } from 'react'

import styles from './RichFieldEditor.less'

interface Props {
    children: ReactNode
    onError?: (error: Error) => void
}

interface State {
    hasError: boolean
    errorCount: number
}

export class DraftJsErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false,
        errorCount: 0,
    }

    componentDidCatch(error: Error) {
        // Only catch the specific removeChild error from speech-to-text extensions
        if (
            error.message.includes('removeChild') ||
            error.message.includes('not a child')
        ) {
            this.setState((prevState) => ({
                hasError: true,
                errorCount: prevState.errorCount + 1,
            }))

            // Auto-recover after a very brief delay (just long enough to prevent infinite loop)
            setTimeout(() => {
                this.setState({ hasError: false })
            }, 50)

            this.props.onError?.(error)
        } else {
            // Re-throw other errors
            throw error
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.errorBoundaryContainer}>
                    <div className={styles.errorBoundaryText}>Loading...</div>
                </div>
            )
        }

        return this.props.children
    }
}
