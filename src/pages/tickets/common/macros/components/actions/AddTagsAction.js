import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'

import TicketTags from '../../../../detail/components/TicketDetails/TicketTags'

export default class AddTagsAction extends React.Component {
    splitIncomingTags = () =>
        this.props.args
            .get('tags', '')
            .split(',')
            .filter((t) => !!t)

    addTags = (tags) => {
        let newTags = this.splitIncomingTags()
        newTags = newTags.concat(tags).join(',')
        this.props.updateActionArgs(this.props.index, fromJS({tags: newTags}))
    }

    removeTag = (tag) => {
        let newTags = this.splitIncomingTags()
        newTags.splice(newTags.indexOf(tag), 1)
        newTags = newTags.join(',')
        this.props.updateActionArgs(this.props.index, fromJS({tags: newTags}))
    }

    render() {
        const {index} = this.props
        const ticketTags = fromJS(
            this.splitIncomingTags().map((t) => ({name: t}))
        )

        return (
            <TicketTags
                ticketTags={ticketTags}
                addTags={this.addTags}
                removeTag={this.removeTag}
                suffix={`macro-modal-${index}`}
            />
        )
    }
}

AddTagsAction.propTypes = {
    args: PropTypes.object,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
}
