import React, {PropTypes} from 'react'
import {TagLabel} from '../../../../common/utils/labels'

export default class TicketTags extends React.Component {
    componentDidMount() {
        $(this.refs.tagDropdown).dropdown({
            allowAdditions: true,
            onChange: () => {
                this.update()
            }
        })
    }

    update = () => {
        const tagDropdown = $(this.refs.tagDropdown)
        const name = tagDropdown.dropdown('get value')

        if (!name || name === '') {
            return
        }

        this.props.addTags(name)
        tagDropdown.dropdown('clear')
    }

    render = () => {
        const {tags, ticketTags, removeTag} = this.props
        const existingTagNames = this.props.ticketTags.map(x => x.get('name'))

        let style = {}
        if (ticketTags.isEmpty()) {
            style = {paddingLeft: 0}
        }

        return (
            <div className="ui labels ticket-tags-wrapper">
                {
                    ticketTags.map((tag, i) => (
                        <TagLabel
                            key={i}
                            name={tag.get('name')}
                            decoration={tag.get('decoration')}
                            className="ticket-tag"
                        >
                            <i
                                className="icon close"
                                onClick={() => removeTag(tag.get('name'))}
                            />
                        </TagLabel>
                    ))
                }
                <div
                    ref="tagDropdown"
                    className="ticket-tag-add-btn ui search button input pointing dropdown link item"
                    style={style}
                    onClick={() => this.refs.tagSearch.focus()}
                >
                    <span>
                        <i className="icon plus" /> ADD TAG
                    </span>

                    <div className="menu">
                        <div className="ui search input">
                            <input id="tag-search" ref="tagSearch" type="text" placeholder="Search tags..." />
                        </div>
                        <div className="hidden item" key="placeholder"></div>
                        {

                            tags.map((tag, i) => {
                                if (!existingTagNames.contains(tag.name)) {
                                    return (
                                        <div
                                            className="item"
                                            key={i}
                                            data-value={tag.name}
                                            onClick={this.update}
                                        >
                                            {tag.name}
                                        </div>
                                    )
                                }

                                return null
                            })
                        }
                    </div>
                </div>


            </div>
        )
    }
}

TicketTags.propTypes = {
    tags: PropTypes.array.isRequired,
    ticketTags: PropTypes.object.isRequired,
    addTags: PropTypes.func.isRequired,
    removeTag: PropTypes.func.isRequired
}
