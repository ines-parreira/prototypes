//@flow
import * as React from 'react'
import {fromJS, List} from 'immutable'

import {suggestionsFilter} from '../../draftjs/plugins/mentions'

type Suggestions = List<*>

type MentionSearchChangeArgs = {
    value: string
}

type RequiredProps = {
    mentionSuggestions?: Suggestions
}

type State = {
    filteredSuggestions: Suggestions
}

export type InjectedProps = {
    mentionSearchResults: Suggestions,
    onMentionSearchChange: MentionSearchChangeArgs => void
}

export default function  provideMentionSearchResults<Props: RequiredProps>(
    WrappedComponent: React.ComponentType<Props & InjectedProps>
): React.ComponentType<Props> {
    class Wrapper extends React.Component<Props, State> {
        constructor(props: Props) {
            super(props)
            this.state = {
                // It looks like an issue with eslint-plugin-react (v 7.4.0)
                // Error: 'mentionSuggestions' is missing in props validation  react/prop-types
                // Disabled for now, check if it's still a problem after version bump.
                filteredSuggestions: props.mentionSuggestions || fromJS([]), // eslint-disable-line
            }
        }

        onSearchChange = ({value}: MentionSearchChangeArgs) => {
            if (!this.props.mentionSuggestions) {
                return
            }

            this.setState({
                filteredSuggestions: suggestionsFilter(value, this.props.mentionSuggestions),
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
