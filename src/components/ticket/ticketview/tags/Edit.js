import React, { PropTypes } from 'react'
import { Map } from 'immutable'
import Immutable from 'immutable'
import classnames from 'classnames'


export default class Edit extends React.Component {
    componentDidMount() {
        const self = this
        setTimeout(() => {  // You delay querySelector to let semantic UI script add his own DOM component
            this.refs.multiselect.querySelector('input.search').onkeydown = (e) => {
                if (e.keyCode === 13) {
                    if (self.refs.multiselect.querySelector('div.item.selected')) {
                        setTimeout(() => {self.update()}, 50)  // you need to delay self.update to actually get the last tags added by semantic UI on Enter and avoid bugs
                        return
                    }
                    const tag = {
                        id: this.value,
                        // user_id: int,
                        name: this.value
                    }
                    self.props.actions.tag.addTags([tag])  // you need to add the tag into tag's 'database' for semanticUI to style your new tag...
                    self.props.actions.ticket.addTags([Immutable.fromJS(tag)])
                }
            }
        }, 50)
        $('#multi-select').dropdown('bind intent')
    }

    update = () => {
        const ticketTags = $('#multi-select').dropdown('get value').split(',')
            .filter((text) => text && text !== '')
            .map((text) => {
                return { name: text }
            })
        this.props.actions.ticket.updateTags(ticketTags)
    }

    close = () => {
        this.update()
        this.props.toggle()
    }

    render() {
        const rows = []
        const row = (value) => <div className="item" key={value} data-value={value}>{value}</div>

        this.props.tags.map(tag => {
            console.log(this.props.ticketTags.toJS())
            console.log(tag)
            if (!this.props.ticketTags.contains(tag)) {
                rows.push(row(tag.name))
            }
        })
        return (
        <div ref="multiselect" className={classnames({ hidden: this.props.hidden })}>
            <i className="icon close" onClick={this.close}/>
            <div className="ui fluid multiple search selection dropdown" id="multi-select">
                <input type="hidden" name="tags"/>
                <i className="dropdown icon"/>
                <div className="default text">tags</div>
                <div className="menu">
                {rows}
                </div>
            </div>
        </div>
        )
    }
}


Edit.propTypes = {
    tags: PropTypes.array.isRequired,
    ticketTags: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    hidden: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
}
