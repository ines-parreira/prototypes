import { useCallback, useMemo, useState } from 'react'

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

import { useShopifyShopTags } from '../../hooks/useShopifyShopTags'
import { useUpdateShopifyCustomerTags } from '../../hooks/useUpdateShopifyCustomerTags'
import type { TagOption } from './shopifyTags.utils'
import {
    buildShopTagOptions,
    extractTagValues,
    parseTags,
    tagsToString,
} from './shopifyTags.utils'

import css from './ShopifyTags.less'

type ShopifyTagsProps = {
    tags: string | undefined
    integrationId: number | undefined
    externalId: string | undefined
    customerId: number | undefined
    ticketId?: string
}

export function ShopifyTags({
    tags,
    integrationId,
    externalId,
    customerId,
    ticketId,
}: ShopifyTagsProps) {
    const [search, setSearch] = useState('')

    const parsedTags = useMemo(() => parseTags(tags), [tags])

    const selectedTags: TagOption[] = useMemo(
        () =>
            parsedTags.map((tag) => ({
                id: tag,
                label: tag,
            })),
        [parsedTags],
    )

    const { data: shopTags, isLoading: isLoadingShopTags } = useShopifyShopTags(
        {
            integrationId,
        },
    )

    const { mutate: updateTags } = useUpdateShopifyCustomerTags()

    const shopTagOptions = useMemo(
        () => buildShopTagOptions(shopTags, search, parsedTags),
        [shopTags, search, parsedTags],
    )

    const handleSelectChange = useCallback(
        (selectedOptions: { id: string; label: string }[]) => {
            if (!integrationId || !externalId || !customerId) return

            const uniqueTags = extractTagValues(selectedOptions)

            updateTags({
                integrationId,
                userId: String(customerId),
                externalId,
                tagsList: tagsToString(uniqueTags),
                ticketId,
            })
        },
        [integrationId, externalId, customerId, updateTags, ticketId],
    )

    const handleCloseTag = useCallback(
        (tagToRemove: string) => {
            if (!integrationId || !externalId || !customerId) return

            const updatedTags = parsedTags.filter((tag) => tag !== tagToRemove)
            updateTags({
                integrationId,
                userId: String(customerId),
                externalId,
                tagsList: tagsToString(updatedTags),
                ticketId,
            })
        },
        [
            integrationId,
            externalId,
            customerId,
            parsedTags,
            updateTags,
            ticketId,
        ],
    )

    if (!integrationId || !externalId || !customerId) {
        return null
    }

    return (
        <div className={css.container}>
            <OverflowList gap="xxxs" nonExpandedLineCount={2}>
                <OverflowListItem>
                    <MultiSelect
                        trigger={() =>
                            selectedTags.length === 0 ? (
                                <Button
                                    leadingSlot="add-plus"
                                    variant="secondary"
                                    size="sm"
                                >
                                    Add tags
                                </Button>
                            ) : (
                                <Button
                                    icon="add-plus"
                                    variant="secondary"
                                    size="sm"
                                />
                            )
                        }
                        isSearchable
                        searchValue={search}
                        onSearchChange={setSearch}
                        items={shopTagOptions}
                        selectedItems={selectedTags}
                        onSelect={handleSelectChange}
                        maxHeight={256}
                        isLoading={isLoadingShopTags}
                        aria-label="Shopify customer tags"
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
                {parsedTags.map((tag) => (
                    <OverflowListItem key={tag}>
                        <Tag
                            onClose={() => handleCloseTag(tag)}
                            aria-label="Remove tag"
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
