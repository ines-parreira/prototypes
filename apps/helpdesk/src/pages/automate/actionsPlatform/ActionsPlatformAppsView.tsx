import React, { useMemo, useState } from 'react'

import { useHistory } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'
import AutomateListView from 'pages/automate/common/components/AutomateListView'
import Search from 'pages/common/components/Search'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import ActionsPlatformAppsTableRow from './components/ActionsPlatformAppsTableRow'
import useApps from './hooks/useApps'
import useGetAppFromActionsApp from './hooks/useGetAppFromActionsApp'

import css from './ActionsPlatformAppsView.less'

const ActionsPlatformAppsView = () => {
    const {
        apps = [],
        isLoading: isAppsLoading,
        actionsApps,
    } = useApps([IntegrationType.App])
    const getAppFromActionsApp = useGetAppFromActionsApp({ apps })
    const history = useHistory()

    const [name, setName] = useState('')

    const filteredActionsApps = useMemo(() => {
        const nameLowerCase = name.toLocaleLowerCase().trim()

        return actionsApps.filter((actionsApp) => {
            const app = getAppFromActionsApp(actionsApp)

            if (
                name &&
                !app?.name.toLocaleLowerCase().includes(nameLowerCase)
            ) {
                return false
            }

            return true
        })
    }, [actionsApps, name, getAppFromActionsApp])

    const isLoading = isAppsLoading

    return (
        <AutomateListView
            title="Actions platform"
            headerNavbarItems={[
                {
                    route: '/app/ai-agent/actions-platform/use-cases',
                    title: 'Use case templates',
                    exact: true,
                },
                {
                    route: '/app/ai-agent/actions-platform/steps',
                    title: 'Steps',
                    exact: true,
                },
                {
                    route: '/app/ai-agent/actions-platform/apps',
                    title: 'Apps',
                    exact: true,
                },
            ]}
            isLoading={isLoading}
        >
            <div className={css.content}>
                <div className={css.description}>
                    <span>
                        Maintain authentication method settings for 3rd party
                        Apps.
                    </span>
                    <Button
                        onClick={() => {
                            history.push(
                                '/app/ai-agent/actions-platform/apps/new',
                            )
                        }}
                    >
                        Create App settings
                    </Button>
                </div>
                <div className={css.filters}>
                    <Search
                        value={name}
                        onChange={setName}
                        placeholder="Search name"
                        className={css.search}
                    />
                </div>
            </div>
            <TableWrapper>
                <TableHead>
                    <HeaderCellProperty title="NAME" />
                    <HeaderCellProperty title="AUTHENTICATION METHOD" />
                </TableHead>
                <TableBody>
                    {filteredActionsApps.map((actionsApp) => (
                        <ActionsPlatformAppsTableRow
                            key={actionsApp.id}
                            app={getAppFromActionsApp(actionsApp)}
                            actionsApp={actionsApp}
                            onClick={() => {
                                history.push(
                                    `/app/ai-agent/actions-platform/apps/edit/${actionsApp.id}`,
                                )
                            }}
                        />
                    ))}
                </TableBody>
            </TableWrapper>
        </AutomateListView>
    )
}

export default ActionsPlatformAppsView
