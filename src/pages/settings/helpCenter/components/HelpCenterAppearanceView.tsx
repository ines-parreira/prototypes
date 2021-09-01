import React from 'react'
import {useSelector} from 'react-redux'
import {useAsyncFn} from 'react-use'
import {Container} from 'reactstrap'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {helpCenterUpdated} from '../../../../state/entities/helpCenters/actions'
import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import PageHeader from '../../../common/components/PageHeader'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'

import css from './HelpCenterAppearanceView.less'
import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import {SearchToggle} from './SearchToggle'

export const HelpCenterAppearanceView: React.FC = () => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const helpCenter = useSelector(getCurrentHelpCenter)
    const {client} = useHelpcenterApi()

    const [{loading: updating}, toggleSearch] = useAsyncFn(
        async (toggleValue: boolean) => {
            if (client) {
                try {
                    const {data} = await client.updateHelpCenter(
                        {help_center_id: helpCenterId},
                        {search_deactivated: !toggleValue}
                    )

                    void dispatch(helpCenterUpdated(data))

                    void dispatch(
                        notify({
                            message: 'Help Center successfully updated',
                            status: NotificationStatus.Success,
                        })
                    )
                } catch (err) {
                    console.error(err)

                    void dispatch(
                        notify({
                            message: "Couldn't update the Help Center",
                            status: NotificationStatus.Error,
                        })
                    )
                }
            }
        },
        [client]
    )

    if (!helpCenter) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpcenterName={helpCenter.name}
                        activeLabel="Appearance"
                    />
                }
            />
            <HelpCenterNavigation helpcenterId={helpCenterId} />
            <Container
                fluid
                className="page-container"
                style={{maxWidth: 680, marginLeft: 0}}
            >
                <div className={css.heading}>
                    <h3>Appearance</h3>
                </div>
                <SearchToggle
                    searchActivated={
                        helpCenter.search_deactivated_datetime === null
                    }
                    onToggle={toggleSearch}
                    loading={updating}
                />
            </Container>
        </div>
    )
}

export default HelpCenterAppearanceView
