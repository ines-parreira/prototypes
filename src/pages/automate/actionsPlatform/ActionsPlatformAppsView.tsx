import React, {useMemo, useState} from 'react'
import {useHistory} from 'react-router-dom'

import {useListActionsApps} from 'models/workflows/queries'
import AutomateListView from 'pages/automate/common/components/AutomateListView'
import Search from 'pages/common/components/Search'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import Button from 'pages/common/components/button/Button'

import ActionsPlatformAppsTableRow from './components/ActionsPlatformAppsTableRow'
import useApps from './hooks/useApps'
import useGetAppFromActionsApp from './hooks/useGetAppFromActionsApp'

import css from './ActionsPlatformAppsView.less'

const ActionsPlatformAppsView = () => {
    const {
        data: actionsApps = [],
        isInitialLoading: isActionsAppsInitialLoading,
    } = useListActionsApps()
    const {apps = [], isLoading: isAppsLoading} = useApps()
    const getAppFromActionsApp = useGetAppFromActionsApp({apps})
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

    const isLoading = isActionsAppsInitialLoading || isAppsLoading

    return (
        <AutomateListView
            title="Actions platform"
            headerNavbarItems={[
                {
                    route: '/app/automation/actions-platform',
                    title: 'Templates',
                    exact: true,
                },
                {
                    route: '/app/automation/actions-platform/apps',
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
                                '/app/automation/actions-platform/apps/new'
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
                                    `/app/automation/actions-platform/apps/edit/${actionsApp.id}`
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
