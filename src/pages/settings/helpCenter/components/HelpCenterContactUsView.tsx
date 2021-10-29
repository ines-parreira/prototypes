import React from 'react'
import {connect} from 'react-redux'
import {useParams} from 'react-router-dom'
import {Container} from 'reactstrap'

import PageHeader from '../../../common/components/PageHeader'

import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'

// type Props = RouteComponentProps & ConnectedProps<typeof connector>

export const HelpCenterContactUsView = () => {
    const {helpCenterId} = useParams<{helpCenterId: string}>()
    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName="Help Center Name"
                        activeLabel="Contact Us"
                    />
                }
            />
            <HelpCenterNavigation helpCenterId={helpCenterId} />
            <Container fluid className="page-container">
                Contact Us page
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

export default connector(HelpCenterContactUsView)
