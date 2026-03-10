import { useCallback, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import {
    LegacyIconButton as IconButton,
    LegacyToggleField as ToggleField,
} from '@gorgias/axiom'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import type { StoreIntegration } from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import type { GuidanceArticle } from '../../types'
import { GuidanceActionsBadge } from './GuidanceActionsBadge'

import css from './GuidanceList.less'

type Props = {
    article: GuidanceArticle
    currentStoreIntegrationId: number | undefined
    sortedStoreIntegrations: StoreIntegration[]
    onToggle: (id: number, val: boolean) => void
    onDelete: (id: number) => void
    onDuplicate: (id: number, storeIntegration: StoreIntegration) => void
    onRowClick: (id: number) => void
    availableActions: GuidanceAction[]
}

export const GuidanceListRow = ({
    article,
    currentStoreIntegrationId,
    sortedStoreIntegrations,
    onToggle,
    onDelete,
    onDuplicate,
    onRowClick,
    availableActions,
}: Props) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate,
    )

    const areActionsInGuidancesEnabled: boolean = useFlag<boolean>(
        FeatureFlagKey.AiAgentSupportActionInGuidance,
        false,
    )

    const isCurrentStore = useCallback(
        (storeIntegration: StoreIntegration) =>
            storeIntegration.id === currentStoreIntegrationId,
        [currentStoreIntegrationId],
    )

    const copyToStoreAnchorElsRef = useRef<
        Record<number, HTMLButtonElement | null>
    >({})

    const [copyToStoreDropdownId, setCopyToStoreDropdownId] = useState<
        number | null
    >(null)

    const handleToggleCopyToStoreDropdown = (articleId: number) => {
        setCopyToStoreDropdownId(
            copyToStoreDropdownId === articleId ? null : articleId,
        )
    }

    return (
        <TableBodyRow onClick={() => onRowClick(article.id)}>
            <BodyCell innerClassName={css.itemTitle}>
                <ToggleField
                    value={article.visibility === VisibilityStatusEnum.PUBLIC}
                    aria-label="Toggle guidance visibility"
                    onChange={(val, event) => {
                        event.stopPropagation()
                        onToggle(article.id, val)
                    }}
                />
                {article.title}
                {areActionsInGuidancesEnabled && (
                    <GuidanceActionsBadge
                        article={article}
                        availableActions={availableActions}
                    />
                )}
            </BodyCell>
            <BodyCell>
                {formatDatetime(article.lastUpdated, datetimeFormat)}
            </BodyCell>
            <BodyCell>
                <ConfirmationPopover
                    placement="bottom"
                    buttonProps={{
                        intent: 'destructive',
                    }}
                    confirmLabel="Delete"
                    title="Delete Guidance?"
                    content={
                        <p>
                            Are you sure you want to delete{' '}
                            <b>{article.title}</b> Guidance?
                        </p>
                    }
                    onConfirm={() => {
                        onDelete(article.id)
                    }}
                >
                    {({ uid, elementRef, onDisplayConfirmation }) => (
                        <IconButton
                            onClick={onDisplayConfirmation}
                            id={uid}
                            className={css.deleteButton}
                            fillStyle="ghost"
                            intent="secondary"
                            aria-label="Delete guidance"
                            ref={elementRef}
                            icon="delete"
                        />
                    )}
                </ConfirmationPopover>
            </BodyCell>
            <BodyCell
                size="smallest"
                onClick={(event) => {
                    event.stopPropagation()
                }}
            >
                <IconButton
                    icon="file_copy"
                    intent="secondary"
                    fillStyle="ghost"
                    ref={(el) => {
                        copyToStoreAnchorElsRef.current[article.id] =
                            el as HTMLButtonElement
                    }}
                    aria-label="Duplicate guidance"
                    onClick={() => {
                        handleToggleCopyToStoreDropdown(article.id)
                    }}
                />
                {copyToStoreDropdownId === article.id && (
                    <Dropdown
                        isOpen={true}
                        target={{
                            current:
                                copyToStoreAnchorElsRef.current[article.id],
                        }}
                        placement="bottom-end"
                        onToggle={() =>
                            handleToggleCopyToStoreDropdown(article.id)
                        }
                        safeDistance={0}
                    >
                        <DropdownBody>
                            <DropdownSection title="DUPLICATE TO">
                                {sortedStoreIntegrations.map(
                                    (storeIntegration) => (
                                        <DropdownItem
                                            option={{
                                                value: storeIntegration.id,
                                                label: `${storeIntegration.name}
            ${isCurrentStore(storeIntegration) ? ' (current store)' : ''}`,
                                            }}
                                            key={storeIntegration.id}
                                            onClick={() => {
                                                setCopyToStoreDropdownId(null)
                                                onDuplicate(
                                                    article.id,
                                                    storeIntegration,
                                                )
                                            }}
                                        />
                                    ),
                                )}
                            </DropdownSection>
                        </DropdownBody>
                    </Dropdown>
                )}
            </BodyCell>
        </TableBodyRow>
    )
}
