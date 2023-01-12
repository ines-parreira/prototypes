import React, {Component, ComponentType} from 'react'
import {fromJS, List} from 'immutable'

import {suggestionsFilter} from '../../draftjs/plugins/mentions'

type RequiredProps = {
    mentionSuggestions?: List<any>
}

type State = {
    filteredSuggestions: List<any>
}

export type InjectedProps = {
    mentionSearchResults: List<any>
    onMentionSearchChange: (mentionSearchChangeArgs: {value: string}) => void
}

export default function provideMentionSearchResults<
    Props extends RequiredProps
>(
    WrappedComponent: ComponentType<Props & InjectedProps>
): ComponentType<Props> {
    class Wrapper extends Component<Props, State> {
        constructor(props: Props) {
            super(props)
            this.state = {
                filteredSuggestions: props.mentionSuggestions || fromJS([]),
            }
        }

        onSearchChange = ({value}: {value: string}) => {
            if (!this.props.mentionSuggestions) {
                return
            }

            this.setState({
                filteredSuggestions: suggestionsFilter(
                    value,
                    this.props.mentionSuggestions
                ),
            })
        }

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    mentionSearchResults={this.state.filteredSuggestions}
                    onMentionSearchChange={this.onSearchChange}
                />
            )
        }
    }

    return Wrapper
}
