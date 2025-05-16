import cssNavbar from 'assets/css/navbar.less'
import { StatsNavLink } from 'pages/stats/common/components/StatsNav/StatsNavLink'
import { VOICE_OF_CUSTOMER_ROUTES } from 'routes/constants'

import { VOICE_OF_CUSTOMER_SECTION_NAME } from './utils'

export const VoiceOfCustomerNavbarView = () => {
    return (
        <>
            <div className={cssNavbar.category}>
                <div className={cssNavbar.menu}>
                    <StatsNavLink
                        to={`${VOICE_OF_CUSTOMER_ROUTES.OVERVIEW}`}
                        title={VOICE_OF_CUSTOMER_SECTION_NAME}
                    />
                </div>
            </div>
        </>
    )
}
