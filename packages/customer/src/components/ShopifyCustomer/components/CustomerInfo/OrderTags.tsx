import { useCallback, useEffect, useMemo, useState } from 'react'

import { useDebouncedCallback } from '@repo/hooks'

import {
    Button,
    CheckBoxField,
    Icon,
    ListItem,
    MultiSelect,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
    Tag,
} from '@gorgias/axiom'

import { useShopifyOrderShopTags } from '../../hooks/useShopifyOrderShopTags'
import { useUpdateShopifyOrderTags } from '../../hooks/useUpdateShopifyOrderTags'
import type { TagOption } from './shopifyTags.utils'
import {
    buildShopTagOptions,
    extractTagValues,
    parseTags,
    tagsToString,
} from './shopifyTags.utils'

import css from './ShopifyTags.less'

type OrderTagsProps = {
    tags: string | undefined
    integrationId: number | undefined
    orderId: number | string | undefined
    ticketId?: string
    readOnly?: boolean
}

export function OrderTags({
    tags,
    integrationId,
    orderId,
    ticketId,
    readOnly = false,
}: OrderTagsProps) {
    const [search, setSearch] = useState('')
    const [localTagsString, setLocalTagsString] = useState<string | undefined>(
        tags,
    )

    useEffect(() => {
        setLocalTagsString(tags)
    }, [tags])

    const parsedTags = useMemo(
        () => parseTags(localTagsString),
        [localTagsString],
    )

    const selectedTags: TagOption[] = useMemo(
        () =>
            parsedTags.map((tag) => ({
                id: tag,
                label: tag,
            })),
        [parsedTags],
    )

    const { data: shopTags, isLoading: isLoadingShopTags } =
        useShopifyOrderShopTags({ integrationId })

    const { mutate: updateTags, isLoading } = useUpdateShopifyOrderTags()

    const shopTagOptions = useMemo(
        () => buildShopTagOptions(shopTags, search, parsedTags),
        [shopTags, search, parsedTags],
    )

    const debouncedUpdateTags = useDebouncedCallback(updateTags, 300)

    const handleSelectChange = useCallback(
        (selectedOptions: { id: string; label: string }[]) => {
            if (!integrationId || orderId === undefined || isLoading) return

            const uniqueTags = extractTagValues(selectedOptions)
            const tagsList = tagsToString(uniqueTags)

            setLocalTagsString(tagsList)
            debouncedUpdateTags({
                integrationId,
                orderId,
                tagsList,
                ticketId,
            })
        },
        [integrationId, orderId, isLoading, debouncedUpdateTags, ticketId],
    )

    const handleCloseTag = useCallback(
        (tagToRemove: string) => {
            if (!integrationId || orderId === undefined || isLoading) return

            const updatedTags = parsedTags.filter((tag) => tag !== tagToRemove)
            const tagsList = tagsToString(updatedTags)

            setLocalTagsString(tagsList)
            debouncedUpdateTags({
                integrationId,
                orderId,
                tagsList,
                ticketId,
            })
        },
        [
            integrationId,
            orderId,
            isLoading,
            parsedTags,
            debouncedUpdateTags,
            ticketId,
        ],
    )

    if (!integrationId || orderId === undefined) {
        return null
    }

    return (
        <div className={css.container}>
            <OverflowList gap="xxxs" nonExpandedLineCount={2}>
                {!readOnly && (
                    <OverflowListItem>
                        <MultiSelect
                            trigger={({ ref }) => (
                                <>
                                    {selectedTags.length === 0 ? (
                                        <Button
                                            ref={ref}
                                            slot="button"
                                            leadingSlot={
                                                <Icon name="add-plus" />
                                            }
                                            variant="secondary"
                                            size="sm"
                                        >
                                            Add tags
                                        </Button>
                                    ) : (
                                        <Button
                                            ref={ref}
                                            slot="button"
                                            icon="add-plus"
                                            variant="secondary"
                                            size="sm"
                                        />
                                    )}
                                </>
                            )}
                            isSearchable
                            searchValue={search}
                            onSearchChange={setSearch}
                            items={shopTagOptions}
                            selectedItems={selectedTags}
                            onSelect={handleSelectChange}
                            maxHeight={256}
                            isLoading={isLoadingShopTags}
                            aria-label="Shopify order tags"
                        >
                            {(option) => (
                                <ListItem
                                    key={option.id}
                                    label={option.label}
                                    leadingSlot={({ isSelected }) =>
                                        !option.id.startsWith('__new__') ? (
                                            <CheckBoxField value={isSelected} />
                                        ) : null
                                    }
                                />
                            )}
                        </MultiSelect>
                    </OverflowListItem>
                )}
                {parsedTags.map((tag) => (
                    <OverflowListItem key={tag}>
                        <Tag
                            onClose={
                                readOnly ? undefined : () => handleCloseTag(tag)
                            }
                            aria-label={readOnly ? tag : 'Remove tag'}
                        >
                            {tag}
                        </Tag>
                    </OverflowListItem>
                ))}
                <OverflowListShowMore>
                    {({ hiddenCount }) => (
                        <div className={css.overflowButtonContent}>
                            <span>+{hiddenCount}</span>
                            <Icon name="arrow-chevron-down" />
                        </div>
                    )}
                </OverflowListShowMore>
                <OverflowListShowLess>
                    <div className={css.overflowButtonContent}>
                        <span>Show less</span>
                        <Icon name="arrow-chevron-up" />
                    </div>
                </OverflowListShowLess>
            </OverflowList>
        </div>
    )
}
