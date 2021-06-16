import React, {Component, ComponentType} from 'react'
import classnames from 'classnames'

import {Map} from 'immutable'

import {Theme} from '../types'

type Props = {
    entryComponent: ComponentType<
        Partial<{
            className: string
            onMouseDown: (event: Event) => void
            onMouseUp: () => void
            onMouseEnter: () => void
            role: string
            theme: Theme
            mention: Map<any, any>
            searchValue: string
        }>
    >
    searchValue: string
    onMentionSelect: (T: Map<any, any>) => void
    mention: Map<any, unknown>
    index: number
    onMentionFocus: (T: number) => void
    theme: Theme
    isFocused?: boolean
    id?: string
}

export default class Entry extends Component<Props> {
    mouseDown: boolean

    constructor(props: Props) {
        super(props)
        this.mouseDown = false
    }

    componentDidUpdate() {
        this.mouseDown = false
    }

    onMouseUp = () => {
        if (this.mouseDown) {
            this.props.onMentionSelect(this.props.mention)
            this.mouseDown = false
        }
    }

    onMouseDown = (event: Event) => {
        // Note: important to avoid a content edit change
        event.preventDefault()

        this.mouseDown = true
    }

    onMouseEnter = () => {
        this.props.onMentionFocus(this.props.index)
    }

    render() {
        const {theme = {}, searchValue} = this.props
        const EntryComponent = this.props.entryComponent
        return (
            <EntryComponent
                className={classnames(theme.mentionSuggestionsEntry, {
                    [theme.mentionSuggestionsEntryFocused as string]: this.props
                        .isFocused,
                })}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onMouseEnter={this.onMouseEnter}
                role="option"
                theme={theme}
                mention={this.props.mention}
                searchValue={searchValue}
            />
        )
    }
}
