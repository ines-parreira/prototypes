import { useCallback, useMemo, useRef, useState } from 'react'

import { IconButton, ToggleField } from '@gorgias/merchant-ui-kit'

import { DateAndTimeFormatting } from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { OrderDirection } from 'models/api/types'
import { StoreIntegration } from 'models/integration/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { formatDatetime } from 'utils'

import { GuidanceArticle } from '../../types'

import css from './GuidanceList.less'

type SortState = {
    column: 'title' | 'lastUpdated'
    direction: OrderDirection
}

const initialSortState: SortState = {
    column: 'lastUpdated',
    direction: OrderDirection.Desc,
}

const compareDates = (a: string, b: string, direction: OrderDirection) => {
    return direction === OrderDirection.Asc
        ? new Date(a).getTime() - new Date(b).getTime()
        : new Date(b).getTime() - new Date(a).getTime()
}

type Props = {
    guidanceArticles: GuidanceArticle[]
    currentStoreIntegrationId: number | undefined
    onDelete: (articleId: number) => void
    onDuplicate: (articleId: number, storeIntegration: StoreIntegration) => void
    onRowClick: (articleId: number) => void
    onChangeVisibility: (articleId: number, isVisible: boolean) => void
}

export const GuidanceList = ({
    guidanceArticles,
    currentStoreIntegrationId,
    onDelete,
    onDuplicate,
    onRowClick,
    onChangeVisibility,
}: Props) => {
    const [sortState, setSortState] = useState<SortState>(initialSortState)
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const anchorElsRef = useRef<Record<number, HTMLButtonElement | null>>({})
    const storeIntegrations = useStoreIntegrations()
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate,
    )

    const onSortClick = (column: SortState['column']) => {
        const initialDirection =
            sortState.column === column ? undefined : OrderDirection.Asc
        const newDirection =
            sortState.direction === OrderDirection.Asc
                ? OrderDirection.Desc
                : OrderDirection.Asc

        setSortState({
            column,
            direction: initialDirection ?? newDirection,
        })
    }

    const onToggle = (articleId: number, isVisible: boolean) => {
        onChangeVisibility(articleId, isVisible)
    }

    const sortedGuidanceArticles = useMemo(
        () =>
            guidanceArticles.sort((a, b) => {
                if (sortState.column === 'title') {
                    return sortState.direction === OrderDirection.Asc
                        ? a.title.localeCompare(b.title)
                        : b.title.localeCompare(a.title)
                }

                if (sortState.column === 'lastUpdated') {
                    return compareDates(
                        a.lastUpdated,
                        b.lastUpdated,
                        sortState.direction,
                    )
                }

                return 0
            }),
        [guidanceArticles, sortState.column, sortState.direction],
    )

    const handleToggleDropdown = (articleId: number) => {
        setOpenDropdownId(openDropdownId === articleId ? null : articleId)
    }

    const currentFirstSorted = useMemo(() => {
        return [...storeIntegrations].sort(
            ({ id: integrationIdA }, { id: integrationIdB }) => {
                if (integrationIdA === currentStoreIntegrationId) return -1
                if (integrationIdB === currentStoreIntegrationId) return 1
                return 0
            },
        )
    }, [currentStoreIntegrationId, storeIntegrations])

    const isCurrentStore = useCallback(
        (storeIntegration: StoreIntegration) =>
            storeIntegration.id === currentStoreIntegrationId,
        [currentStoreIntegrationId],
    )

    return (
        <TableWrapper>
            <TableHead>
                <HeaderCellProperty
                    title="My Guidances"
                    titleClassName={css.titleCell}
                    onClick={() => onSortClick('title')}
                    isOrderedBy={sortState.column === 'title'}
                    direction={sortState.direction}
                />
                <HeaderCellProperty
                    title="Last updated"
                    titleClassName={css.titleCell}
                    onClick={() => onSortClick('lastUpdated')}
                    isOrderedBy={sortState.column === 'lastUpdated'}
                    direction={sortState.direction}
                />

                <HeaderCell />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {sortedGuidanceArticles.map((article) => (
                    <TableBodyRow
                        key={article.id}
                        onClick={() => onRowClick(article.id)}
                    >
                        <BodyCell innerClassName={css.itemTitle}>
                            <ToggleField
                                value={article.visibility === 'PUBLIC'}
                                aria-label="Toggle guidance visibility"
                                onChange={(val, event) => {
                                    event.stopPropagation()
                                    onToggle(article.id, val)
                                }}
                            />
                            {article.title}
                        </BodyCell>
                        <BodyCell>
                            {formatDatetime(
                                article.lastUpdated,
                                datetimeFormat,
                            )}
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
                                {({
                                    uid,
                                    elementRef,
                                    onDisplayConfirmation,
                                }) => (
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
                                    anchorElsRef.current[article.id] =
                                        el as HTMLButtonElement
                                }}
                                aria-label="Duplicate guidance"
                                onClick={() => {
                                    handleToggleDropdown(article.id)
                                }}
                            />
                            {openDropdownId === article.id && (
                                <Dropdown
                                    isOpen={true}
                                    target={{
                                        current:
                                            anchorElsRef.current[article.id],
                                    }}
                                    placement="bottom-end"
                                    onToggle={() =>
                                        handleToggleDropdown(article.id)
                                    }
                                    safeDistance={0}
                                >
                                    <DropdownBody>
                                        <DropdownSection title="DUPLICATE TO">
                                            {currentFirstSorted.map(
                                                (storeIntegration) => (
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
                                                        key={
                                                            storeIntegration.id
                                                        }
                                                        onClick={() => {
                                                            setOpenDropdownId(
                                                                null,
                                                            )
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
                ))}
            </TableBody>
        </TableWrapper>
    )
}
