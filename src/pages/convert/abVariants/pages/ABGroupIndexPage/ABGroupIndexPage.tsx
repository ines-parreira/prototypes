import React from 'react'

import {Route, Switch, useParams} from 'react-router-dom'

import {Container} from 'reactstrap'

import {useGetCampaign} from 'models/convert/campaign/queries'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import {CONVERT_ROUTE_CAMPAIGN_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteAbVariantParams} from 'pages/convert/common/types'
import {ABGroupContainer} from 'pages/convert/abVariants/containers/ABGroupContainer'
import {
    abVariantsControlVersionPath,
    abVariantEditorPath,
    abVariantsPath,
} from 'pages/convert/abVariants/urls'
import ABTestSettingsPage from 'pages/convert/abVariants/pages/ABTestSettingsPage'
import ABTestVariantEditPage from 'pages/convert/abVariants/pages//ABTestVariantEditPage'

import css from './ABGroupIndexPage.less'

const ABGroupIndexPage = () => {
    const {[CONVERT_ROUTE_CAMPAIGN_PARAM_NAME]: campaignId} =
        useParams<ConvertRouteAbVariantParams>()

    const {data, isLoading} = useGetCampaign(
        {campaign_id: campaignId || ''},
        {enabled: !!campaignId}
    )

    if (isLoading || !data) {
        return (
            <Container fluid className={css.pageContainer}>
                <div className={css.mainLoader}>
                    <Skeleton height={75} width={'100%'} />
                </div>

                <div className={css.mainLoader}>
                    <Skeleton height={75} width={'100%'} />
                </div>

                <div className={css.tableLoader}>
                    <Skeleton height={50} width={'100%'} />
                </div>
                <div>
                    <SkeletonLoader className={css.loader} length={3} />
                </div>
            </Container>
        )
    }

    return (
        <ABGroupContainer campaign={data as Campaign}>
            <Container fluid className={css.pageContainer}>
                <Switch>
                    <Route exact path={abVariantsPath}>
                        <ABTestSettingsPage />
                    </Route>
                    <Route exact path={abVariantsControlVersionPath}>
                        <ABTestVariantEditPage />
                    </Route>
                    <Route exact path={abVariantEditorPath}>
                        <ABTestVariantEditPage />
                    </Route>
                </Switch>
            </Container>
        </ABGroupContainer>
    )
}

export default ABGroupIndexPage
