// @flow
import React, {Component} from 'react'
import classnames from 'classnames'

import type {Map} from 'immutable'

import type {themeType} from '../types'

type Props = {
    entryComponent: any,
    searchValue: string,
    onMentionSelect: (T: Map<*, *>) => void,
    mention: Map<*, *>,
    index: number,
    onMentionFocus: (T: number) => void,
    theme: themeType,
    isFocused?: boolean,
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
                    [theme.mentionSuggestionsEntryFocused]: this.props
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
