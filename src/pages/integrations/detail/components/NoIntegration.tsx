import React, {Component} from 'react'

import Loader from 'pages/common/components/Loader/Loader'

type Props = {
    loading: boolean
}

export default class NoIntegration extends Component<Props> {
    render() {
        const {loading} = this.props

        if (loading) {
            return <Loader />
        }

        return <div>You have no integration of this type at the moment.</div>
    }
}
