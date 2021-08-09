import React, {ReactElement, useState, useMemo, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {bindActionCreators} from 'redux'
import {useRouteMatch} from 'react-router-dom'
import produce from 'immer'
import _uniqueId from 'lodash/uniqueId'
import _omit from 'lodash/omit'

import useAppDispatch from '../../../../../../hooks/useAppDispatch'

import TableWrapper from '../../../../../common/components/table/TableWrapper'
import TableBody from '../../../../../common/components/table/TableBody'
import HeaderCell from '../../../../../common/components/table/cells/HeaderCell'
import TableHead from '../../../../../common/components/table/TableHead'
import {Callbacks} from '../../../../../settings/helpCenter/hooks/useReorderDnD'

import {useConfigurationData} from '../../hooks'
import {getSelfServiceConfigurations} from '../../../../../../state/self_service/selectors'
import {getIntegrationsByTypes} from '../../../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../../../models/integration/types'
import * as SelfServiceActions from '../../../../../../state/self_service/actions'
import {SelfServiceReportIssueCase as ReportIssueCaseType} from '../../../../../../state/self_service/types'

import ReportIssueCase from './ReportIssueCase'

type ReportIssueCaseWithIdType = ReportIssueCaseType & {id: string}

const ReportIssueCasesList = (): ReactElement | null => {
    const [cases, setCases] = useState<ReportIssueCaseWithIdType[]>([])

    const selfServiceConfigurations = useSelector(getSelfServiceConfigurations)
    const shopifyIntegrations = useSelector(
        getIntegrationsByTypes(IntegrationType.ShopifyIntegrationType)
    )
    const dispatch = useAppDispatch()
    const actions = useMemo(() => {
        return bindActionCreators(SelfServiceActions, dispatch)
    }, [dispatch])
    const {
        params: {shopName, integrationType},
    } = useRouteMatch<{shopName: string; integrationType: string}>()
    const {isLoadingConfig, configuration} = useConfigurationData({
        selfServiceConfigurations,
        actions,
        shopifyIntegrations,
        matchParams: {shopName, integrationType},
    })

    useEffect(() => {
        if (configuration) {
            const {
                report_issue_policy: {cases: casesFromApi},
            } = configuration

            const casesWithIds = casesFromApi.map((reportIssueCase) => ({
                ...reportIssueCase,
                id: _uniqueId(),
            }))

            setCases(casesWithIds)
        }
    }, [configuration])

    const handleMoveEntity: Callbacks['onHover'] = (dragIndex, hoverIndex) => {
        const newCases = produce(cases, (casesDraft) => {
            const dragCase = casesDraft[dragIndex]

            if (dragCase) {
                casesDraft.splice(dragIndex, 1)
                casesDraft.splice(hoverIndex, 0, dragCase)
            }
        })

        setCases(newCases)
    }

    const handleDropEntity: Callbacks['onDrop'] = () => {
        if (!configuration) {
            return
        }

        const newConfiguration = produce(
            configuration,
            (draftConfiguration) => {
                draftConfiguration.report_issue_policy.cases = cases.map(
                    (reportIssueCase) => {
                        return _omit<ReportIssueCaseWithIdType>(
                            reportIssueCase,
                            ['id']
                        ) as ReportIssueCaseType
                    }
                )
            }
        )

        actions.updateSelfServiceConfigurations(newConfiguration)
    }

    if (isLoadingConfig) {
        return null
    }

    return (
        <TableWrapper>
            <TableHead>
                <HeaderCell style={{width: 25}} />
                <HeaderCell style={{width: 100}} />
                <HeaderCell style={{width: 'initial'}} />
                <HeaderCell style={{width: 25}} />
            </TableHead>
            <TableBody>
                {cases.map((reportIssueCase, index) => {
                    return (
                        <ReportIssueCase
                            key={reportIssueCase.id}
                            position={index}
                            reportIssueCase={reportIssueCase}
                            onMoveEntity={handleMoveEntity}
                            onDropEntity={handleDropEntity}
                            isFallbackCase={index === cases.length - 1}
                        />
                    )
                })}
            </TableBody>
        </TableWrapper>
    )
}

export default ReportIssueCasesList
