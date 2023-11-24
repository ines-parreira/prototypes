import React, {useCallback, useMemo, useRef, useState} from 'react'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {LanguageList} from 'pages/common/components/LanguageBulletList'
import IconButton from 'pages/common/components/button/IconButton'

import {StoreIntegration} from 'models/integration/types'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'

import DropdownSection from 'pages/common/components/dropdown/DropdownSection'
import {
    LanguageCode,
    supportedLanguages,
} from '../models/workflowConfiguration.types'
import {Workflow} from './WorkflowsList'
import css from './WorkflowsRow.less'
import DeleteWorkflowAction from './DeleteWorkflowAction'

type Props = {
    storeIntegrationId: number
    entrypoint: Workflow
    onDelete: (workflowId: string) => Promise<void>
    onDuplicate: (
        workflowId: string,
        storeIntegrationId: number
    ) => Promise<{id: string}>
    goToEditWorkflowPage: (workflowId: string) => void
    isUpdatePending: boolean
    storeIntegrations: StoreIntegration[]
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
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

// Notify merchant does not support JSX elements, so we need to use a string
export const getLink = (
    storeIntegration: StoreIntegration
) => `Successfully duplicated to <br />
<a href='/app/automation/${
    storeIntegration.type
}/${getShopNameFromStoreIntegration(storeIntegration)}/flows'>${
    storeIntegration.name
}</a>`

const WorkflowsRow = ({
    storeIntegrationId,
    entrypoint,
    onDelete,
    onDuplicate,
    goToEditWorkflowPage,
    isUpdatePending,
    storeIntegrations,
    notifyMerchant,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const anchorEl = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const currentFirstSorted = useMemo(() => {
        return [...storeIntegrations].sort(
            ({id: integrationIdA}, {id: integrationIdB}) => {
                if (integrationIdA === storeIntegrationId) return -1
                if (integrationIdB === storeIntegrationId) return 1
                return 0
            }
        )
    }, [storeIntegrationId, storeIntegrations])

    const isCurrentStore = useCallback(
        (storeIntegration: StoreIntegration) =>
            storeIntegration.id === storeIntegrationId,
        [storeIntegrationId]
    )

    const handleToggle = () => setIsOpen(!isOpen)

    const handleDuplicateCurrentStore = async (workflowId: string) => {
        await onDuplicate(workflowId, storeIntegrationId)
        notifyMerchant(`Successfully duplicated`, 'success')
    }

    const isDropdownVisible = storeIntegrations.length > 1

    return (
        <TableBodyRow key={entrypoint.workflow_id}>
            <BodyCell
                className={css.name}
                onClick={() => {
                    goToEditWorkflowPage(entrypoint.workflow_id)
                }}
            >
                {entrypoint.name}
            </BodyCell>
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
                        )[0] as any
                    }
                    languageList={
                        getLanguageList(
                            entrypoint.available_languages
                        ).reverse() as any
                    }
                />
            </BodyCell>

            <BodyCell size="smallest">
                <IconButton
                    className="mr-1"
                    fillStyle="ghost"
                    intent="secondary"
                    isDisabled={isUpdatePending}
                    ref={isDropdownVisible ? anchorEl : undefined}
                    onClick={() =>
                        isDropdownVisible
                            ? handleToggle()
                            : handleDuplicateCurrentStore(
                                  entrypoint.workflow_id
                              )
                    }
                    title="Duplicate flow"
                >
                    file_copy
                </IconButton>

                {isDropdownVisible && (
                    <Dropdown
                        isOpen={isOpen}
                        target={anchorEl}
                        ref={dropdownRef}
                        placement="bottom-end"
                        onToggle={() => handleToggle()}
                        safeDistance={0}
                    >
                        <DropdownBody>
                            <DropdownSection title="DUPLICATE TO">
                                {currentFirstSorted.map((storeIntegration) => (
                                    <DropdownItem
                                        option={{
                                            value: storeIntegration.id,
                                            label: `${storeIntegration.name}
                                ${
                                    isCurrentStore(storeIntegration)
                                        ? ' (current store)'
                                        : ''
                                }`,
                                        }}
                                        key={storeIntegration.id}
                                        onClick={async (value) => {
                                            setIsOpen(false)
                                            await onDuplicate(
                                                entrypoint.workflow_id,
                                                value
                                            )
                                            notifyMerchant(
                                                isCurrentStore(storeIntegration)
                                                    ? 'Successfully duplicated'
                                                    : getLink(storeIntegration),
                                                'success'
                                            )
                                        }}
                                    />
                                ))}
                            </DropdownSection>
                        </DropdownBody>
                    </Dropdown>
                )}
                <DeleteWorkflowAction
                    onDelete={() => {
                        void onDelete(entrypoint.workflow_id)
                    }}
                    isUpdatePending={isUpdatePending}
                />
            </BodyCell>
        </TableBodyRow>
    )
}

export default WorkflowsRow
