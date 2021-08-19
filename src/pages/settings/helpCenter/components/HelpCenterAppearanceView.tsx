import React from 'react'
import {Container} from 'reactstrap'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {helpCenterUpdated} from '../../../../state/entities/helpCenters/actions'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import PageHeader from '../../../common/components/PageHeader'
import {useCurrentHelpCenter} from '../hooks/useCurrentHelpCenter'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'

import css from './HelpCenterAppearanceView.less'
import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import {SearchToggle} from './SearchToggle'

export const HelpCenterAppearanceView: React.FC = () => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const {isLoading, data: helpCenter} = useCurrentHelpCenter(helpCenterId)
    const {client} = useHelpcenterApi()

    const toggleSearch = async (searchActivated: boolean) => {
        if (client) {
            try {
                const {data} = await client.updateHelpCenter(
                    {
                        help_center_id: helpCenterId,
                    },
                    {
                        search_deactivated: !searchActivated,
                    }
                )
                dispatch(helpCenterUpdated(data))
                void dispatch(
                    notify({
                        message: 'Help Center successfully updated',
                        status: NotificationStatus.Success,
                    })
                )
            } catch (err) {
                void dispatch(
                    notify({
                        message: "Couldn't update the Help Center",
                        status: NotificationStatus.Error,
                    })
                )
                console.error(err)
            }
        }
    }

    if (isLoading || !helpCenter) {
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
                    searchActivated={!helpCenter.search_deactivated_datetime}
                    onToggle={toggleSearch}
                />
            </Container>
        </div>
    )
}

export default HelpCenterAppearanceView
