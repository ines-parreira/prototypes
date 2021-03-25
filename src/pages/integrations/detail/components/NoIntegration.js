import React from 'react'
import PropTypes from 'prop-types'

import Loader from '../../../common/components/Loader/Loader.tsx'

export default class NoIntegration extends React.Component {
    render() {
        const {loading} = this.props

        if (loading) {
            return <Loader />
        }

        return <div>You have no integration of this type at the moment.</div>
    }
}

NoIntegration.propTypes = {
    type: PropTypes.string,
    loading: PropTypes.bool.isRequired,
}
