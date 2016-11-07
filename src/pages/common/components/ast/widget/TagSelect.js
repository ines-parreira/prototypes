import React, { PropTypes } from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Map } from 'immutable'

import * as tagsActions from '../../../../../state/tags/actions'
import Select from './Select'


class TagSelect extends React.Component {
    componentDidMount() {
        const { actions, tags } = this.props
        if (!tags.length) {
            actions.tags.fetchTags()
        }
    }

    render() {
        const { onChange, tags, value } = this.props
        const options = tags.get('items').map(tag => tag.get('name'))

        return <Select value={value} onChange={onChange} options={options} />
    }
}

TagSelect.propTypes = {
    actions: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    tags: PropTypes.object,
    value: PropTypes.string,
}

TagSelect.defaultProps = {
    tags: Map()
}

const mapStateToProps = (state) => ({
    tags: state.tags,
})

const mapDispatchToProps = (dispatch) => ({
    actions: {
        tags: bindActionCreators(tagsActions, dispatch),
    },
})

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TagSelect)
