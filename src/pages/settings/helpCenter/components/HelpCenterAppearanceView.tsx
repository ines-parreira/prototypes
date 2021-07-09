import React from 'react'
import {connect} from 'react-redux'
import {useParams} from 'react-router-dom'
import {Container} from 'reactstrap'

import PageHeader from '../../../common/components/PageHeader'

import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'

// type Props = RouteComponentProps & ConnectedProps<typeof connector>

export const HelpCenterAppearanceView = () => {
    const {helpcenterId} = useParams<{helpcenterId: string}>()
    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpcenterName="Helpcenter Name"
                        activeLabel="Appearance"
                    />
                }
            />
            <HelpCenterNavigation helpcenterId={helpcenterId} />
            <Container fluid className="page-container">
                Appearance page
            </Container>
        </div>
    )
}

const connector = connect()
// (state: RootState) => {
//     return {}
// },
// (dispatch: GorgiasThunkDispatch<any, any, any>) => {
//     return {}
// }

export default connector(HelpCenterAppearanceView)
