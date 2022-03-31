import React, {useState, useEffect} from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'
import {fetchApp} from 'models/integration/resources'
import {AppDetail as AppDetailType} from 'models/integration/types/app'
import Loader from 'pages/common/components/Loader/Loader'
import Detail from 'pages/integrations/detail/components/Detail'

export default function AppDetail() {
    const {appId} = useParams<{
        appId: string
    }>()

    const [appItem, setAppDetail] = useState<AppDetailType | null>(null)
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        async function loadAppDetails(appId: string) {
            try {
                const res = await fetchApp(appId)
                setAppDetail(res)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        setLoading(true)
        void loadAppDetails(appId)
    }, [appId])

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
                                Integrations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>{appItem.title}</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Detail {...appItem} />
        </div>
    )
}
