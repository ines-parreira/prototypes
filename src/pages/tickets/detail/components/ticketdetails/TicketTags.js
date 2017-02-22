import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {TagLabel} from '../../../../common/utils/labels'
import {fieldEnumSearch} from '../../../../../state/views/actions'

import _debounce from 'lodash/debounce'

export class TicketTags extends React.Component {
    state = {
        enum: [],
    }

    componentDidMount() {
        $(this.refs.tagDropdown).dropdown({
            allowAdditions: true,
            onChange: () => {
                this.update()
            }
        })

        this._search()
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

    _search = _debounce((search) => {
        const field = fromJS({
            filter: {type: 'tag'}
        })

        this.props.fieldEnumSearch(field, search)
            .then((data) => {
                this.setState({
                    enum: data,
                })
            })
    }, 300)

    render = () => {
        const {ticketTags, removeTag} = this.props
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
                            <input
                                ref="tagSearch"
                                type="text"
                                placeholder="Search tags..."
                                onChange={(e) => this._search(e.target.value)}
                            />
                        </div>
                        <div className="hidden item" key="placeholder"></div>
                        {

                            this.state.enum.map((tag, i) => {
                                if (!existingTagNames.contains(tag.get('name'))) {
                                    return (
                                        <div
                                            className="item"
                                            key={i}
                                            data-value={tag.get('name')}
                                            onClick={this.update}
                                        >
                                            {tag.get('name')}
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
    ticketTags: PropTypes.object.isRequired,
    addTags: PropTypes.func.isRequired,
    removeTag: PropTypes.func.isRequired,
    fieldEnumSearch: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
    fieldEnumSearch,
}

export default connect(null, mapDispatchToProps)(TicketTags)
