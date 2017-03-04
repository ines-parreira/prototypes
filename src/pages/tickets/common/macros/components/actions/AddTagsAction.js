import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import TicketTags from '../../../../detail/components/ticketdetails/TicketTags'

export default class AddTagsAction extends React.Component {
    splitIncomingTags = () => this.props.args.get('tags', '').split(',').filter(t => !!t)

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
        const {deleteAction, index} = this.props
        const ticketTags = fromJS(this.splitIncomingTags().map(t => ({name: t})))

        return (
            <div>
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4 className="inline">ADD TAGS</h4>
                <TicketTags
                    ticketTags={ticketTags}
                    addTags={this.addTags}
                    removeTag={this.removeTag}
                    suffix={`macro-modal-${index}`}
                />
            </div>
        )
    }
}

AddTagsAction.propTypes = {
    args: PropTypes.object,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
