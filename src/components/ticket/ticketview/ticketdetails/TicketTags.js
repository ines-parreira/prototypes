import React, { PropTypes } from 'react'
import { Map } from 'immutable'
import _ from 'lodash'


export default class TicketTags extends React.Component {
    componentDidMount() {
        $(`#tag-dropdown-${this.props.suffix}`).dropdown({
            allowAdditions: true,
            onChange: () => {
                this.update()
            }
        })

        $(document).on('click', `#tag-dropdown-${this.props.suffix} > .menu > .addition.item.selected`, this.update)
    }

    update = () => {
        const tagDropdown = $(`#tag-dropdown-${this.props.suffix}`)
        const name = tagDropdown.dropdown('get value')

        if (!name || name === '') {
            return
        }

        const tag = _.first(this.props.tags.filter(curTag => curTag.name === name)) || { name }
        this.props.addTag([Map(tag)])
        tagDropdown.dropdown('clear')
    }

    render = () => {
        const { tags, ticketTags, removeTag } = this.props
        const existingTagNames = this.props.ticketTags.map(x => x.get('name'))
        let style = {}

        if (!ticketTags.size) { style = { paddingLeft: 0 } }

        return (
            <div className="ui labels">
                <div>

                    {
                        ticketTags.map((tag, i) => (
                            <div key={i} className="ticket-tag ui label">
                                {tag.get('name')}
                                <i className="icon close" onClick={() => removeTag(i)}/>
                            </div>
                        ))
                    }

                    <div
                        id={`tag-dropdown-${this.props.suffix}`}
                        className="ticket-tag-add-btn ui search button input pointing dropdown link item"
                        style={style}
                        onClick={() => this.refs.tagSearch.focus()}
                    >
                        <span>
                            <i className="icon plus" /> ADD TAG
                        </span>

                        <div className="menu">
                            <div className="ui search input">
                                <input id="tag-search" ref="tagSearch" type="text" placeholder="Search tags..."/>
                            </div>
                            <div className="hidden item" key="placeholder"></div>
                            {

                                tags.map(tag => {
                                    if (!existingTagNames.contains(tag.name)) {
                                        return (
                                            <div
                                                className="item"
                                                key={tag.name}
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
            </div>
        )
    }
}


TicketTags.propTypes = {
    tags: PropTypes.array.isRequired,
    ticketTags: PropTypes.object.isRequired,
    addTag: PropTypes.func.isRequired,
    removeTag: PropTypes.func.isRequired,
    suffix: PropTypes.string
}
