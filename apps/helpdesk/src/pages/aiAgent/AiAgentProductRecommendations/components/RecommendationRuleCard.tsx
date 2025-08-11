import { useEffect, useState } from 'react'

import {
    Badge,
    Button,
    ColorType,
    IconButton,
    LoadingSpinner,
    Skeleton,
} from '@gorgias/axiom'

import css from './RecommendationRuleCard.less'

export const RecommendationRuleCard = ({
    title,
    description,
    isLoading,
    disableActions,
    hasImages,
    badge,
    addButton,
    itemLabelSingular,
    itemLabelPlural,
    items,
    onDelete,
    onSeeAllClick,
}: {
    title: string
    description: string
    isLoading: boolean
    disableActions: boolean
    hasImages: boolean
    badge: {
        label: string
        type: ColorType
    }
    addButton: {
        label: string
        onClick: () => void
    }
    itemLabelSingular: string
    itemLabelPlural: string
    items: Array<{
        id: string
        title: string
        img?: string
    }>
    onDelete: (id: string) => Promise<void>
    onSeeAllClick: () => void
}) => {
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

    useEffect(() => {
        if (deletingItemId === null) return

        if (!items.some((item) => item.id === deletingItemId)) {
            setDeletingItemId(null)
        }
    }, [items, deletingItemId])

    return (
        <div className={css.card}>
            <div className={css.top}>
                <div className={css.left}>
                    <div className={css.title}>{title}</div>
                    <div className={css.text}>{description}</div>

                    {!isLoading && (
                        <div className={css.text}>
                            {items.length}{' '}
                            {items.length !== 1
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
                        <div>
                            <Badge type={badge.type} upperCase={false}>
                                {badge.label}
                            </Badge>
                        </div>
                        <div className={css.iconContainer}>
                            {deletingItemId === item.id && (
                                <LoadingSpinner size="small" />
                            )}

                            {deletingItemId !== item.id && (
                                <IconButton
                                    size="small"
                                    fillStyle="ghost"
                                    className={css.iconButton}
                                    onClick={async () => {
                                        setDeletingItemId(item.id)
                                        await onDelete(item.id)
                                    }}
                                    aria-label={`Remove ${itemLabelSingular}`}
                                    icon="close"
                                    isDisabled={disableActions}
                                />
                            )}
                        </div>
                    </div>
                ))}

            {!isLoading && items.length > 4 && (
                <div className={css.seeAll}>
                    <Button
                        intent="secondary"
                        fillStyle="ghost"
                        onClick={onSeeAllClick}
                        isDisabled={disableActions}
                        aria-label={`See All ${itemLabelPlural[0].toUpperCase()}${itemLabelPlural.slice(1)}`}
                    >
                        See All {itemLabelPlural[0].toUpperCase()}
                        {itemLabelPlural.slice(1)}
                    </Button>
                </div>
            )}
        </div>
    )
}
