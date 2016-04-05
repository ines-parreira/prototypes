import React, {PropTypes} from 'react'
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
          <Read hidden={this.state.edit} tags={this.props.tags} toggle={this.toggle} actions={this.props.actions}/>
          <Edit hidden={!this.state.edit} tags={this.props.tags} toggle={this.toggle} onSelect={this.onSelectTag} actions={this.props.actions}/>
        </div>
      )
    }
}
const Read = (props) => {
  return (
    <div className={classnames({hidden: props.hidden})}>
      {
        props.tags.map((tag, i) => {
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
          const tag = Immutable.fromJS({
            //id: int,
            //user_id: int,
            name: this.value
          })
          defaultTags[this.value] = 0 //you need to add the tag into tag's 'database' for semantic to style your new tag...
          self.props.actions.ticket.addTags([tag])
        }
      }
    }, 50)
    $('#multi-select').dropdown('bind intent')
  }

  componentDidUpdate() {
    $('#multi-select').dropdown('set exactly', this.props.tags.map(tag => tag.get('name').toLowerCase()).toJS())
  }

  update = () => {
    const tags = $('#multi-select').dropdown('get value').split(",").map((text) => {
      return {
        //id: int,
        //user_id: int,
        name: text
      }
    })
    this.props.actions.ticket.updateTags(tags)
  }

  close = () => {
    this.update()
    this.props.toggle()
  }

  render () {
    let rows = []
    const row = (value) => {
      return <div className='item' data-value={value}>{value}</div>
    }
    for (var key in defaultTags) {
      rows.push(row(key));
    }
}

TicketTags.propTypes = {
    tags: PropTypes.object.isRequired,
}
