import {
    AnalyticsCustomReport,
    useListAnalyticsCustomReports,
} from '@gorgias/api-queries'
import classnames from 'classnames'
import React, {useMemo} from 'react'
import {useHistory} from 'react-router-dom'

import cssNavbar from 'assets/css/navbar.less'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import css from 'pages/stats/custom-reports/CustomReportsNavbarBlock/CustomReportsNavbarBlock.less'

type Props = {
    navBarLinkProps: Partial<NavbarLinkProps>
}

export const CUSTOM_REPORTS_NAV_TITLE = 'CUSTOM REPORTS'
export const CREATE_CUSTOM_REPORT = 'Create Custom Report'

export const CustomReportsNavbarBlock = ({navBarLinkProps}: Props) => {
    const history = useHistory()
    const {data} = useListAnalyticsCustomReports()

    const customReports: AnalyticsCustomReport[] = data?.data?.data ?? []

    const actions = useMemo(
        () => [
            {
                label: CREATE_CUSTOM_REPORT,
                onClick: () => {
                    history.push('/app/stats/custom-reports/new')
                },
            },
        ],
        [history]
    )

    return (
        <NavbarBlock
            icon="insert_chart"
            title={CUSTOM_REPORTS_NAV_TITLE}
            actions={actions}
            className={css.navbar}
        >
            {customReports.map(({name, id, emoji}) => (
                <div
                    key={id}
                    className={classnames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested
                    )}
                >
                    <NavbarLink
                        {...navBarLinkProps}
                        to={`/app/stats/custom-reports/${id}`}
                        className={css.wrapper}
                    >
                        {emoji && <span>{emoji}</span>}
                        <div className={css.name}>{name}</div>
                    </NavbarLink>
                </div>
            ))}
        </NavbarBlock>
    )
}
