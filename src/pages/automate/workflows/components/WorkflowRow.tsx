import React, {useCallback, useMemo, useRef, useState} from 'react'

import {DateAndTimeFormatting} from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {StoreIntegration} from 'models/integration/types'

import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import IconButton from 'pages/common/components/button/IconButton'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'
import {LanguageList} from 'pages/common/components/LanguageBulletList'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {formatDatetime} from 'utils'

import {
    LanguageCode,
    supportedLanguages,
    WorkflowConfigurationShallow,
} from '../models/workflowConfiguration.types'
import DeleteWorkflowAction from './DeleteWorkflowAction'

import {DraftBadge} from './DraftBadge'
import css from './WorkflowsRow.less'

type Props = {
    storeIntegrationId: number
    workflow: WorkflowConfigurationShallow
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

const WorkflowRow = ({
    storeIntegrationId,
    workflow,
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

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    )

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
        <TableBodyRow
            onClick={() => {
                goToEditWorkflowPage(workflow.id)
            }}
        >
            <BodyCell className={css.name}>
                {workflow.name}
                {workflow.is_draft && (
                    <span className={css.leftSpacingMd}>
                        <DraftBadge />
                    </span>
                )}
            </BodyCell>
            <BodyCell size="smallest">
                <LanguageList
                    id={`workflow-${workflow.id}-language-list`}
                    defaultLanguage={
                        getLanguageList(workflow.available_languages)[0]
                    }
                    languageList={getLanguageList(
                        workflow.available_languages
                    ).reverse()}
                />
            </BodyCell>
            <BodyCell size="smallest">
                {workflow.updated_datetime &&
                    formatDatetime(workflow.updated_datetime, datetimeFormat)}
            </BodyCell>
            <BodyCell
                size="smallest"
                onClick={(event) => {
                    event.stopPropagation()
                }}
            >
                <IconButton
                    className="mr-1"
                    fillStyle="ghost"
                    intent="secondary"
                    isDisabled={isUpdatePending}
                    ref={isDropdownVisible ? anchorEl : undefined}
                    onClick={() =>
                        isDropdownVisible
                            ? handleToggle()
                            : handleDuplicateCurrentStore(workflow.id)
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
                                                workflow.id,
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
                        void onDelete(workflow.id)
                    }}
                    isUpdatePending={isUpdatePending}
                />
            </BodyCell>
        </TableBodyRow>
    )
}

export default WorkflowRow
