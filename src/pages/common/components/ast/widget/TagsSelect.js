import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import MultiSelectField from '../../../forms/MultiSelectField'

function mapStateToProps(state) {
    return {
        tags: state.tags.get('items')
    }
}

@connect(mapStateToProps)
export default class TagsSelect extends Component {
    static defaultProps = {
        value: ''
    }
    static propTypes = {
        tags: PropTypes.object,
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired
    }

    _onChange = (value) => {
        this.props.onChange(value.join(','))
    }

    render() {
        const {tags, value} = this.props
        const options = tags.map(tag => {
            return {
                label: tag.get('name'),
                value: tag.get('name')
            }
        }).toJS()

        return (
            <MultiSelectField
                values={value.split(',').filter(value => value !== '')}
                options={options}
                singular="tag"
                plural="tags"
                allowCustomValues
                onChange={this._onChange}
            />

        )
    }

}

