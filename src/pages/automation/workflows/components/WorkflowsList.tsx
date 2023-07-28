import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {LanguageList} from 'pages/common/components/LanguageBulletList'

import {
    LanguageCode,
    supportedLanguages,
} from '../models/workflowConfiguration.types'
import DeleteWorkflowAction from './DeleteWorkflowAction'

import css from './WorkflowsList.less'

type Props = {
    storeWorkflows: Array<{
        workflow_id: string
        name: string
        available_languages: LanguageCode[]
    }>
    onDelete: (workflowId: string) => Promise<void>
    onDuplicate: (workflowId: string) => Promise<{id: string}>
    goToEditWorkflowPage: (workflowId: string) => void
    isUpdatePending: boolean
}

function getLanguageList(
    availableLanguages: LanguageCode[]
): {code: LanguageCode; name: string}[] {
    return availableLanguages.map((code) => ({
        code,
        name:
            supportedLanguages.find((lang) => lang.code === code)?.label ||
            code,
    }))
}

const WorkflowsList = ({
    storeWorkflows: entrypoints,
    onDelete,
    goToEditWorkflowPage,
    isUpdatePending,
}: Props) => {
    const shouldDisplayLanguageList =
        useFlags()[FeatureFlagKey.FlowsMultiLanguages]
    return (
        <TableWrapper className={css.container}>
            <TableBody>
                {entrypoints.map((entrypoint) => (
                    <TableBodyRow key={entrypoint.workflow_id}>
                        <BodyCell
                            className={css.name}
                            onClick={() => {
                                goToEditWorkflowPage(entrypoint.workflow_id)
                            }}
                        >
                            {entrypoint.name}
                        </BodyCell>
                        {shouldDisplayLanguageList && (
                            <BodyCell
                                size="smallest"
                                onClick={() => {
                                    goToEditWorkflowPage(entrypoint.workflow_id)
                                }}
                            >
                                <LanguageList
                                    id={`workflow-${entrypoint.workflow_id}-language-list`}
                                    defaultLanguage={
                                        getLanguageList(
                                            entrypoint.available_languages
                                        )[0]
                                    }
                                    languageList={getLanguageList(
                                        entrypoint.available_languages
                                    ).reverse()}
                                />
                            </BodyCell>
                        )}
                        <BodyCell size="smallest">
                            {/*<IconButton*/}
                            {/*    className="mr-1"*/}
                            {/*    fillStyle="ghost"*/}
                            {/*    intent="secondary"*/}
                            {/*    isDisabled={isUpdatePending}*/}
                            {/*    onClick={async (e) => {*/}
                            {/*        e.stopPropagation()*/}
                            {/*        const duplicated = await onDuplicate(*/}
                            {/*            entrypoint.workflow_id*/}
                            {/*        )*/}
                            {/*        goToEditWorkflowPage(duplicated.id)*/}
                            {/*    }}*/}
                            {/*    title="Duplicate flow"*/}
                            {/*>*/}
                            {/*    file_copy*/}
                            {/*</IconButton>*/}
                            <DeleteWorkflowAction
                                onDelete={() => {
                                    void onDelete(entrypoint.workflow_id)
                                }}
                                isUpdatePending={isUpdatePending}
                            />
                        </BodyCell>
                    </TableBodyRow>
                ))}
            </TableBody>
        </TableWrapper>
    )
}

export default WorkflowsList
