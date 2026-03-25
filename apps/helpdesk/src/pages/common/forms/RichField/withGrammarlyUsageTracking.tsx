import type { ComponentType } from 'react'
import React, { Component } from 'react'

import { tryLocalStorage } from '@repo/browser-storage'
import { logEvent, SegmentEvent } from '@repo/logging'

export type InjectedProps = {
    detectGrammarly: () => void
}

type State = {
    grammarlyAlreadyLogged: boolean
}

const GRAMMARLY_EXTENSION_TAG = 'grammarly-extension'
export const GRAMMARLY_FOUND_LOCAL_STORAGE_TAG =
    'grammarly-extension-last-found'
const SEGMENT_LOG_THROTTLE_TIME = 24 * 3600 * 1000 // 24h in milliseconds.

function findGrammarlyOnPage(): boolean {
    return document.getElementsByTagName(GRAMMARLY_EXTENSION_TAG).length > 0
}

export default function withGrammarlyUsageTracking<Props>(
    WrappedComponent: ComponentType<Props & InjectedProps>,
): ComponentType<Props> {
    class Wrapper extends Component<Props, State> {
        state: State = {
            grammarlyAlreadyLogged: false,
        }

        _detectGrammarly = () => {
            // check if grammarly was found in the last 24 hours.
            const grammarlyAlreadyLogged =
                this.state.grammarlyAlreadyLogged ||
                (window.localStorage &&
                    Date.now() -
                        +localStorage.getItem(
                            GRAMMARLY_FOUND_LOCAL_STORAGE_TAG,
                        )! <
                        SEGMENT_LOG_THROTTLE_TIME)

            // Grammarly extension is activated (and its elements created) only after the editor is focused
            // for the first time. And DOM changes happen asynchronously. So we need to wrap this with a
            // setTimeout((), 0) to wait for the extension initialization to happen.
            setTimeout(() => {
                if (grammarlyAlreadyLogged || !findGrammarlyOnPage()) {
                    return
                }
                logEvent(SegmentEvent.GrammarlyEnabled)
                this.setState({ grammarlyAlreadyLogged: true })
                tryLocalStorage(() =>
                    window.localStorage.setItem(
                        GRAMMARLY_FOUND_LOCAL_STORAGE_TAG,
                        Date.now().toString(),
                    ),
                )
            }, 0)
        }

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    detectGrammarly={this._detectGrammarly}
                />
            )
        }
    }

    return Wrapper
}
