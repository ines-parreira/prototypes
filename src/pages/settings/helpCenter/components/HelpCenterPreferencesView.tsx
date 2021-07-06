import React from 'react'
import {connect, useSelector} from 'react-redux'
import {Button, Container} from 'reactstrap'

import PageHeader from '../../../common/components/PageHeader'

import {getLocalesResponseFixture} from '../fixtures/getLocalesResponse.fixtures'
import {LanguagePreferencesSettings} from '../providers/LanguagePreferencesSettings'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'

import {readHelpcenterById} from '../../../../state/entities/helpCenters/selectors'

import {HelpCenterNavigation} from './HelpCenterNavigation'
import {DefaultLanguageSelect} from './DefaultLanguageSelect'
import {AvailableLanguagesTags} from './AvailableLanguagesTags'
import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'

// type Props = RouteComponentProps & ConnectedProps<typeof connector>

export const HelpCenterPreferencesView = () => {
    const helpcenterId = useHelpCenterIdParam()
    const data = useSelector(readHelpcenterById(helpcenterId.toString()))

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpcenterName={data.name}
                        activeLabel="Preferences"
                    />
                }
            />
            <HelpCenterNavigation helpcenterId={helpcenterId} />
            <LanguagePreferencesSettings helpcenterId={helpcenterId}>
                <Container
                    fluid
                    className="page-container"
                    style={{maxWidth: 680, marginLeft: 0}}
                >
                    <DefaultLanguageSelect
                        localesAvailable={getLocalesResponseFixture}
                    />
                    <AvailableLanguagesTags />
                    <footer style={{marginTop: 64}}>
                        <Button color="success">Save Changes</Button>
                        <Button className="ml-2">Cancel</Button>
                    </footer>
                </Container>
            </LanguagePreferencesSettings>
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

export default connector(HelpCenterPreferencesView)
