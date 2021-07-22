import React, {ReactNode, PureComponent} from 'react'
import {datadogLogs} from '@datadog/browser-logs'
import {Button, Card, CardBody, Collapse} from 'reactstrap'
import {Emoji} from 'emoji-mart'

import {isProduction, isStaging} from '../utils/environment'
import {reportError} from '../utils/errors'

import css from './ErrorBoundary.less'

type Props = {
    children: ReactNode
}

type State = {
    error: Error | null
    areDetailsOpen: boolean
}

export class ErrorBoundary extends PureComponent<Props, State> {
    state: State = {
        error: null,
        areDetailsOpen: false,
    }

    static getDerivedStateFromError(error: Error) {
        return {
            error,
            areDetailsOpen: false,
        }
    }

    componentDidCatch(
        error: Error,
        errorInfo: {
            componentStack: string
        }
    ) {
        if (isStaging() || isProduction()) {
            datadogLogs.logger.error(error.toString(), {
                extra: errorInfo,
            })
        }
        reportError(error, {extra: errorInfo})
    }

    _onToggle = () => {
        const {areDetailsOpen} = this.state
        this.setState({areDetailsOpen: !areDetailsOpen})
    }

    _onReload = () => {
        window.location.reload()
    }

    render() {
        const {children} = this.props
        const {error, areDetailsOpen} = this.state

        if (!error) {
            return children
        }

        return (
            <div className={css.container}>
                <h1>
                    Oops{' '}
                    <Emoji
                        emoji="white_frowning_face"
                        size={16}
                        sheetSize={32}
                        forceSize
                    />
                </h1>
                <h4>An error occurred!</h4>
                <Button
                    color="primary"
                    className="mr-2 mb-2"
                    onClick={this._onReload}
                >
                    Reload the page
                </Button>
                <Button
                    color="secondary"
                    className="mr-2 mb-2"
                    onClick={this._onToggle}
                >
                    Show details
                </Button>
                <Collapse isOpen={areDetailsOpen}>
                    <Card className="mb-2">
                        <CardBody>{error.toString()}</CardBody>
                    </Card>
                </Collapse>
            </div>
        )
    }
}
