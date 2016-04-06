import React, {PropTypes} from 'react'
import Immutable from 'immutable'
import classnames from 'classnames'
import _ from 'lodash'

export default class TicketTags extends React.Component {
    constructor() {
      super()
      this.state = {
        edit: false
      }
    }
    toggle = () => {
      this.setState({
        edit: !this.state.edit
      })
    }
    render = () => {
      return (
        <div className="ui labels">
          <Read hidden={this.state.edit} tags={this.props.tags} ticketTags={this.props.ticketTags} toggle={this.toggle} actions={this.props.actions}/>
          <Edit hidden={!this.state.edit} tags={this.props.tags} ticketTags={this.props.ticketTags} toggle={this.toggle} onSelect={this.onSelectTag} actions={this.props.actions}/>
        </div>
      )
    }
}
const Read = (props) => {
  return (
    <div className={classnames({hidden: props.hidden})}>
      {
        props.ticketTags.map((tag, i) => {
          return (
            <div key={tag.get('id')} className="ticket-tag ui label">
              {tag.get('name')}
              <i className="icon close" onClick={() => props.actions.ticket.removeTag(i)}/>
            </div>
          )
        })
      }

      <button className="ticket-tag-add-btn ui button" onClick={props.toggle}>
        <i className="icon plus" />
        ADD TAG
      </button>

    </div>
  )
}

class Edit extends React.Component {
  componentDidMount() {
    const self = this
    setTimeout(() => { //You delay querySelector to let semantic UI script add his own DOM component
      this.refs.multiselect.querySelector('input.search').onkeydown = function(e) {
        if(e.keyCode === 13) {
          if(self.refs.multiselect.querySelector('div.item.selected')) {
            setTimeout(()=> {self.update()}, 50) //you need to delay self.update to actually get the last tags added by semantic UI on Enter and avoid bugs
            return
          }
          const tag = {
            id: this.value,
            //user_id: int,
            name: this.value
          }
          self.props.actions.tag.addTags([tag]) //you need to add the tag into tag's 'database' for semanticUI to style your new tag...
          self.props.actions.ticket.addTags([Immutable.fromJS(tag)])
        }
      }
    }, 50)
    $('#multi-select').dropdown('bind intent')
  }

  componentDidUpdate() {
    $('#multi-select').dropdown('set exactly', this.props.ticketTags.map(tag => tag.get('name').toLowerCase()).toJS())
  }

  update = () => {
    const ticketTags = $('#multi-select').dropdown('get value').split(",").map((text) => {
      return {
        //id: int,
        //user_id: int,
        name: text
      }
    })
    this.props.actions.ticket.updateTags(ticketTags)
  }

  close = () => {
    this.update()
    this.props.toggle()
  }

  render () {
    let rows = []
    const row = (value) => {
      return <div className='item' key={value} data-value={value}>{value}</div>
    }

    this.props.tags.map(tag => rows.push(row(tag.name)))
    return (
      <div ref='multiselect' className={classnames({hidden: this.props.hidden})}>
        <i className="icon close" onClick={this.close}/>
        <div className="ui fluid multiple search selection dropdown" id='multi-select'>
          <input type="hidden" name="tags"/>
          <i className="dropdown icon"></i>
          <div className="default text">tags</div>
          <div className="menu">
            {rows}
          </div>
        </div>
      </div>
    )
  }
}

TicketTags.propTypes = {
    tags: PropTypes.array.isRequired,
    ticketTags: PropTypes.object.isRequired
}
