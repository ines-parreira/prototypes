import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'

import { Box, TabItem, TabList, Tabs } from '@gorgias/axiom'

import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DownloadTicketsSLAsData } from 'domains/reporting/pages/sla/components/DownloadTicketsSLAsData'
import { DownloadVoiceCallsSLAsData } from 'domains/reporting/pages/sla/components/DownloadVoiceCallsSLAsData'
import { SLA_PAGE_TITLE } from 'domains/reporting/pages/sla/constants'
import { ServiceLevelAgreements } from 'domains/reporting/pages/sla/ServiceLevelAgreements'
import { VoiceServiceLevelAgreements } from 'domains/reporting/pages/sla/voice/VoiceServiceLevelAgreements'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import { currentAccountHasProduct } from 'state/billing/selectors'

enum SLATabs {
    Tickets = 'Tickets',
    Calls = 'Calls',
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
        [SLATabs.Calls]: `${path}/calls`,
    }

    return (
        <Box w="100%" flexDirection="column">
            <StatsPage
                title={SLA_PAGE_TITLE}
                titleExtra={
                    <Switch>
                        {isVoiceTabAvailable && (
                            <Route path={tabRoutes[SLATabs.Calls]} exact>
                                <DownloadVoiceCallsSLAsData />
                            </Route>
                        )}
                        <Route path={tabRoutes[SLATabs.Tickets]}>
                            <DownloadTicketsSLAsData />
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
                                    id={tabRoutes[SLATabs.Calls]}
                                    label="Calls"
                                />
                            </TabList>
                        </Tabs>
                    </>
                )}

                <Switch>
                    {isVoiceTabAvailable && (
                        <Route path={tabRoutes[SLATabs.Calls]} exact>
                            <VoiceServiceLevelAgreements />
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
