import React, {ReactElement, useState, useEffect} from 'react'
import produce from 'immer'
import _uniqueId from 'lodash/uniqueId'
import _omit from 'lodash/omit'

import TableWrapper from '../../../../../common/components/table/TableWrapper'
import TableBody from '../../../../../common/components/table/TableBody'
import HeaderCell from '../../../../../common/components/table/cells/HeaderCell'
import TableHead from '../../../../../common/components/table/TableHead'
import {Callbacks} from '../../../../../settings/helpCenter/hooks/useReorderDnD'
import {useConfigurationData} from '../../hooks'
import {SelfServiceReportIssueCase as ReportIssueCaseType} from '../../../../../../models/selfServiceConfiguration/types'
import {updateSelfServiceConfiguration} from '../../../../../../models/selfServiceConfiguration/resources'
import {selfServiceConfigurationUpdated} from '../../../../../../state/entities/selfServiceConfigurations/actions'
import {notify} from '../../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../../state/notifications/types'
import useAppDispatch from '../../../../../../hooks/useAppDispatch'

import ReportIssueCase from './ReportIssueCase'

type ReportIssueCaseWithIdType = ReportIssueCaseType & {id: string}

const ReportIssueCasesList = (): ReactElement | null => {
    const dispatch = useAppDispatch()
    const [cases, setCases] = useState<ReportIssueCaseWithIdType[]>([])
    const {isLoadingConfig, configuration} = useConfigurationData()

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

    const handleDropEntity: Callbacks['onDrop'] = async () => {
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

        try {
            const res = await updateSelfServiceConfiguration(newConfiguration)
            void dispatch(selfServiceConfigurationUpdated(res))
            void (await dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Policy successfully updated.',
                })
            ))
        } catch (error) {
            void (await dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not update policy, please try again later.',
                })
            ))
        }
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
