import React from 'react'
import {fromJS, Map} from 'immutable'

import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'

type Props = {
    args: Map<string, string>
    index: number
    updateActionArgs: (index: number, args: Map<string, string>) => void
}

export default class AddTagsAction extends React.Component<Props> {
    splitIncomingTags = () =>
        this.props.args
            .get('tags', '')
            .split(',')
            .filter((t: string) => !!t)

    addTag = (tag: string) => {
        const initialTagList = this.splitIncomingTags()
        const newTagList = initialTagList.concat(tag).join(',')
        this.props.updateActionArgs(
            this.props.index,
            fromJS({tags: newTagList})
        )
    }

    removeTag = (tag: string) => {
        const initialTagList = this.splitIncomingTags()
        initialTagList.splice(initialTagList.indexOf(tag), 1)
        const newTagList = initialTagList.join(',')
        this.props.updateActionArgs(
            this.props.index,
            fromJS({tags: newTagList})
        )
    }

    render() {
        const ticketTags = fromJS(
            this.splitIncomingTags().map((t) => ({name: t}))
        )

        return (
            <TicketTags
                ticketTags={ticketTags}
                addTag={this.addTag}
                removeTag={this.removeTag}
            />
        )
    }
}
