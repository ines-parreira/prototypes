/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */
import type { ReactNode } from 'react'
import React, { Component } from 'react'

import type { EditorState } from 'draft-js'

import type { MentionPluginStore } from '../types'

type Props = {
    offsetKey: string
    store: MentionPluginStore
    getEditorState(): EditorState
    setEditorState(state: EditorState): void
    children: ReactNode
}

export default class MentionSuggestionsPortal extends Component<Props> {
    key!: string
    searchPortal!: HTMLSpanElement | null

    // When inputting Japanese characters (or any complex alphabet which requires
    // hitting enter to commit the characters), that action was causing a race
    // condition when we used componentWillMount. By using componentDidMount
    // instead of componentWillMount, the component will unmount unregister and
    // then properly mount and register after. Prior to this change,
    // componentWillMount would not fire after componentWillUnmount even though it
    // was still in the DOM, so it wasn't re-registering the offsetkey.
    componentDidMount() {
        this.props.store.register(this.props.offsetKey)
        this.updatePortalClientRect(this.props)

        // trigger a re-render so the MentionSuggestions becomes active
        this.props.setEditorState(this.props.getEditorState())
    }

    componentDidUpdate() {
        this.updatePortalClientRect(this.props)
    }

    componentWillUnmount() {
        this.props.store.unregister(this.props.offsetKey)
    }

    updatePortalClientRect(props: Props) {
        this.props.store.updatePortalClientRect(props.offsetKey, () =>
            this.searchPortal!.getBoundingClientRect(),
        )
    }

    render() {
        return (
            <span
                className={this.key}
                ref={(element) => {
                    this.searchPortal = element
                }}
            >
                {this.props.children}
            </span>
        )
    }
}
