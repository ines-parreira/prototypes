import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'

import { Box, TabItem, TabList, Tabs } from '@gorgias/axiom'

import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DownloadSLAsData } from 'domains/reporting/pages/sla/components/DownloadSLAsData'
import { ServiceLevelAgreements } from 'domains/reporting/pages/sla/ServiceLevelAgreements'
import { ServiceLevelAgreementsReportConfig } from 'domains/reporting/pages/sla/ServiceLevelAgreementsReportConfig'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import { currentAccountHasProduct } from 'state/billing/selectors'

enum SLATabs {
    Tickets = 'Tickets',
    Voice = 'Voice',
}

export function ServiceLevelAgreementsPage() {
    const { path } = useRouteMatch()
    const { pathname } = useLocation()
    const isVoiceSLAEnabled = useFlag(FeatureFlagKey.VoiceSLA, false)
    const hasVoiceFeature = useAppSelector(
        currentAccountHasProduct(ProductType.Voice),
    )

    const isVoiceTabAvailable = isVoiceSLAEnabled && hasVoiceFeature

    const tabRoutes = {
        [SLATabs.Tickets]: path,
        [SLATabs.Voice]: `${path}/voice`,
    }

    return (
        <Box w="100%" flexDirection="column">
            <StatsPage
                title={ServiceLevelAgreementsReportConfig.reportName}
                titleExtra={
                    <Switch>
                        {isVoiceTabAvailable && (
                            <Route path={tabRoutes[SLATabs.Voice]} exact>
                                <DownloadSLAsData>
                                    Download calls data
                                </DownloadSLAsData>
                            </Route>
                        )}
                        <Route path={tabRoutes[SLATabs.Tickets]}>
                            <DownloadSLAsData>
                                Download tickets data
                            </DownloadSLAsData>
                        </Route>
                    </Switch>
                }
            >
                {isVoiceTabAvailable && (
                    <>
                        <Box h="16px" />
                        <Tabs
                            defaultSelectedItem={SLATabs.Tickets}
                            selectedItem={pathname}
                            onSelectionChange={(path) =>
                                history.push(path as string)
                            }
                        >
                            <TabList>
                                <TabItem
                                    id={tabRoutes[SLATabs.Tickets]}
                                    label="Tickets"
                                />
                                <TabItem
                                    id={tabRoutes[SLATabs.Voice]}
                                    label="Voice"
                                />
                            </TabList>
                        </Tabs>
                    </>
                )}

                <Switch>
                    {isVoiceTabAvailable && (
                        <Route path={tabRoutes[SLATabs.Voice]} exact>
                            <div>Voice SLA</div>
                        </Route>
                    )}
                    <Route exact path={tabRoutes[SLATabs.Tickets]}>
                        <ServiceLevelAgreements />
                    </Route>
                </Switch>
            </StatsPage>
        </Box>
    )
}
