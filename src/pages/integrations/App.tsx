import React, {useState, useEffect} from 'react'
import {Link, NavLink, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import useSearch from 'hooks/useSearch'
import {AppDetail as AppDetailType} from 'models/integration/types/app'
import PageHeader from 'pages/common/components/PageHeader'
import {fetchApp} from 'models/integration/resources'
import Loader from 'pages/common/components/Loader/Loader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import AppAdvanced from 'pages/integrations/Advanced'
import Detail from 'pages/integrations/components/Detail/Detail'
import {useTitle} from 'hooks/useTitle'

export enum Tab {
    Details = 'details',
    Advanced = 'advanced',
}

function queryStringToBool(flag?: string): boolean {
    return flag === '' || flag === '1' || flag?.toLowerCase() === 'true'
}

export default function AppDetail() {
    const {appId, extra = Tab.Details} = useParams<{
        appId: string
        extra?: string
    }>()

    const search = useSearch<{preview?: string}>()
    const preview = queryStringToBool(search.preview)

    const [appItem, setAppDetail] = useState<AppDetailType | null>(null)
    const [isLoading, setLoading] = useState(false)

    const baseURL = `/app/settings/integrations/app/${appId}`

    useEffect(() => {
        async function loadAppDetails(appId: string) {
            try {
                const res = await fetchApp(appId, preview)
                setAppDetail(res)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        setLoading(true)
        void loadAppDetails(appId)
    }, [appId, preview])

    useTitle(appItem?.title)

    if (!appItem || isLoading) {
        return <Loader minHeight="300px" />
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                All Apps
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>{appItem.title}</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            {appItem.isConnected && (
                <SecondaryNavbar>
                    <NavLink to={baseURL} exact>
                        App Details
                    </NavLink>
                    <NavLink to={`${baseURL}/advanced`} exact>
                        Advanced
                    </NavLink>
                </SecondaryNavbar>
            )}
            {extra === Tab.Advanced && <AppAdvanced {...appItem} />}
            {extra === Tab.Details && <Detail {...appItem} />}
        </div>
    )
}
