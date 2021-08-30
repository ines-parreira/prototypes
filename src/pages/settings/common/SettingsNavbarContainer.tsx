import React from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

import Navbar from '../../common/components/Navbar'
import {RootState} from '../../../state/types'

import SettingsNavbar from './components/SettingsNavbar'

type Props = ConnectedProps<typeof connector> & RouteComponentProps

class SettingsNavbarContainer extends React.Component<Props> {
    render() {
        return (
            <Navbar activeContent="settings">
                <SettingsNavbar {...this.props} />
            </Navbar>
        )
    }
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
    currentAccount: state.currentAccount,
}))

export default withRouter(connector(SettingsNavbarContainer))
