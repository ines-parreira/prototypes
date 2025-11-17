import { useCallback, useEffect, useState } from 'react'

import type { ColorType } from '@gorgias/axiom'
import {
    LegacyButton as Button,
    LegacyIconButton as IconButton,
    LoadingSpinner,
    Skeleton,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { BadgeWithTooltip } from './BadgeWithTooltip'

import css from './RecommendationRuleCard.less'

export const RecommendationRuleCard = ({
    title,
    description,
    isLoading,
    disableActions,
    hasImages,
    type,
    addButton,
    itemLabelSingular,
    itemLabelPlural,
    totalItems,
    items,
    onShowProducts,
    onDelete,
    onSeeAllClick,
}: {
    title: string
    description: string
    isLoading: boolean
    disableActions: boolean
    hasImages: boolean
    type: 'promote' | 'exclude'
    addButton: {
        label: string
        onClick: () => void
    }
    itemLabelSingular: string
    itemLabelPlural: string
    totalItems: number
    items: Array<{
        id: string
        title: string
        img?: string
        badges?: Array<{
            label: string
            type: ColorType
            tooltip?: string
        }>
    }>
    onShowProducts?: (id: string) => void
    onDelete: (id: string) => Promise<void>
    onSeeAllClick: () => void
}) => {
    const dispatch = useAppDispatch()
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

    useEffect(() => {
        if (deletingItemId === null) return

        if (!items.some((item) => item.id === deletingItemId)) {
            setDeletingItemId(null)
        }
    }, [items, deletingItemId])

    const onDeleteItem = useCallback(
        (itemId: string) => async () => {
            try {
                setDeletingItemId(itemId)
                await onDelete(itemId)
            } catch {
                void dispatch(
                    notify({
                        message: 'Failed to save product recommendations.',
                        status: NotificationStatus.Error,
                    }),
                )
            } finally {
                setDeletingItemId(null)
            }
        },
        [onDelete, dispatch],
    )

    return (
        <div className={css.card}>
            <div className={css.top}>
                <div className={css.left}>
                    <div className={css.title}>{title}</div>
                    <div className={css.text}>{description}</div>

                    {!isLoading && (
                        <div className={css.text}>
                            {totalItems}{' '}
                            {totalItems !== 1
                                ? itemLabelPlural
                                : itemLabelSingular}
                        </div>
                    )}

                    {isLoading && <Skeleton width={300} height={32} />}
                </div>
                <div>
                    <Button
                        intent="secondary"
                        onClick={addButton.onClick}
                        isDisabled={disableActions || isLoading}
                    >
                        {addButton.label}
                    </Button>
                </div>
            </div>

            {isLoading && (
                <div className={css.skeletonContainer}>
                    <Skeleton height={200} />
                </div>
            )}

            {!isLoading &&
                items.slice(0, 4).map((item) => (
                    <div key={item.id} className={css.item}>
                        {hasImages && (
                            <div>
                                {item.img ? (
                                    <img
                                        className={css.itemImage}
                                        src={item.img}
                                        alt={item.title}
                                        data-testid="item-image"
                                    />
                                ) : (
                                    <div
                                        className={css.itemImagePlaceholder}
                                        data-testid="item-image-placeholder"
                                    />
                                )}
                            </div>
                        )}
                        <div className={css.itemTitle}>{item.title}</div>
                        {item.badges && item.badges.length > 0 && (
                            <div className={css.badges}>
                                {item.badges.map((badge, i) => (
                                    <BadgeWithTooltip key={i} {...badge} />
                                ))}
                            </div>
                        )}
                        <div className={css.buttons}>
                            {deletingItemId === item.id && (
                                <div className={css.spinnerContainer}>
                                    <LoadingSpinner size="small" />
                                </div>
                            )}

                            {deletingItemId !== item.id && (
                                <IconButton
                                    size="medium"
                                    fillStyle="ghost"
                                    className={css.iconButton}
                                    onClick={onDeleteItem(item.id)}
                                    aria-label={`Remove ${itemLabelSingular}`}
                                    icon="delete_outline"
                                    isDisabled={disableActions}
                                />
                            )}

                            {onShowProducts && (
                                <IconButton
                                    size="medium"
                                    fillStyle="ghost"
                                    className={css.iconButton}
                                    onClick={() => onShowProducts(item.id)}
                                    aria-label="Show products"
                                    icon="keyboard_arrow_right"
                                />
                            )}
                        </div>
                    </div>
                ))}

            {!isLoading && totalItems > 4 && (
                <div className={css.seeAll}>
                    <Button
                        intent="secondary"
                        fillStyle="ghost"
                        onClick={onSeeAllClick}
                        isDisabled={disableActions}
                        aria-label={`See All ${type === 'promote' ? 'Promoted' : 'Excluded'} ${itemLabelPlural.charAt(0).toUpperCase() + itemLabelPlural.slice(1)}`}
                    >
                        See All {type === 'promote' ? 'Promoted' : 'Excluded'}{' '}
                        {itemLabelPlural.charAt(0).toUpperCase() +
                            itemLabelPlural.slice(1)}
                    </Button>
                </div>
            )}
        </div>
    )
}
