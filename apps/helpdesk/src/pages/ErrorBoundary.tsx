import type { ReactNode } from 'react'
import React, { PureComponent } from 'react'

import { reportError } from '@repo/logging'
import { Emoji } from 'emoji-mart'
import { Card, CardBody, Collapse } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import type { SentryTeam } from 'common/const/sentryTeamNames'

import css from './ErrorBoundary.less'

export const SUBHEADER = 'An error occurred!'
export const RELOAD_BUTTON_TEXT = 'Reload page'
export const SHOW_DETAILS_BUTTON_TEXT = 'Show details'

type Props = {
    children: ReactNode
    sentryTags?: Record<string, string> & { team?: SentryTeam }
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
        },
    ) {
        const { sentryTags } = this.props
        reportError(error, {
            extra: errorInfo,
            ...(sentryTags != null ? { tags: sentryTags } : {}),
        })
    }

    _onToggle = () => {
        const { areDetailsOpen } = this.state
        this.setState({ areDetailsOpen: !areDetailsOpen })
    }

    _onReload = () => {
        window.location.reload()
    }

    render() {
        const { children } = this.props
        const { error, areDetailsOpen } = this.state

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
                <h4>{SUBHEADER}</h4>
                <Button
                    className="mr-2 mb-2 float-left"
                    onClick={this._onReload}
                >
                    {RELOAD_BUTTON_TEXT}
                </Button>
                <Button
                    className="mr-2 mb-2"
                    intent="secondary"
                    onClick={this._onToggle}
                >
                    {SHOW_DETAILS_BUTTON_TEXT}
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
