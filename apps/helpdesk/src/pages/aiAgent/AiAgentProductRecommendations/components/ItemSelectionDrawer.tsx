import { useEffect, useState } from 'react'

import { useDebouncedEffect } from '@repo/hooks'

import {
    Button,
    CheckBoxField,
    IconButton,
    LoadingSpinner,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { Drawer } from 'pages/common/components/Drawer'
import { SearchBar } from 'pages/common/components/SearchBar/SearchBar'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { DraftBadge } from './DraftBadge'

import css from './ItemSelectionDrawer.less'

export const ItemSelectionDrawer = ({
    isOpen,
    isLoading,
    hasImages,
    title,
    selectedItemIds,
    itemLabelPlural,
    type,
    items,
    pagination,
    onClose,
    onSubmit,
    onSearch,
}: {
    isOpen: boolean
    isLoading: boolean
    hasImages: boolean
    title: string
    selectedItemIds: string[]
    itemLabelPlural: string
    type?: 'promote' | 'exclude'
    items: Array<{
        id: string
        title: string
        img?: string
        status?: string
    }>
    pagination: {
        hasPrevPage: boolean
        hasNextPage: boolean
        onPrevClick: () => void
        onNextClick: () => void
    }
    onClose: () => void
    onSubmit: (itemsIds: string[]) => Promise<void>
    onSearch: (searchTerm: string) => void
}) => {
    const dispatch = useAppDispatch()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [localSearchTerm, setLocalSearchTerm] = useState('')
    const [localSelectedItemIds, setLocalSelectedItemIds] =
        useState(selectedItemIds)

    useEffect(() => {
        if (!isOpen) return
        setLocalSelectedItemIds(selectedItemIds)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    useEffect(() => {
        const chatContainer = document.getElementById('gorgias-chat-container')

        if (chatContainer) {
            if (isOpen) {
                chatContainer.style.display = 'none'
            } else {
                chatContainer.style.display = ''
            }
        }

        // Cleanup function to ensure chat container is visible when component unmounts
        return () => {
            if (chatContainer) {
                chatContainer.style.display = ''
            }
        }
    }, [isOpen])

    useDebouncedEffect(
        () => {
            onSearch(localSearchTerm)
        },
        [localSearchTerm],
        200,
    )

    const handleItemClick = (itemId: string) =>
        setLocalSelectedItemIds((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId],
        )

    return (
        <Drawer
            fullscreen={false}
            isLoading={false}
            aria-label={title}
            open={isOpen}
            portalRootId="app-root"
            onBackdropClick={onClose}
        >
            <Drawer.Header>
                {title}
                <Drawer.HeaderActions
                    onClose={onClose}
                    closeButtonId="close-drawer"
                />
            </Drawer.Header>

            <Drawer.Content className={css.contentContainer}>
                <div className={css.contentInner}>
                    <div className={css.searchBar}>
                        <SearchBar
                            placeholder={`Search ${itemLabelPlural}`}
                            onChange={setLocalSearchTerm}
                            value={localSearchTerm}
                        />
                    </div>

                    <div className={css.items}>
                        {isLoading && (
                            <div className={css.loading}>
                                <LoadingSpinner size="big" />
                            </div>
                        )}

                        {!isLoading && items.length === 0 && (
                            <div className={css.noItemsFound}>
                                No {itemLabelPlural} found
                            </div>
                        )}

                        {!isLoading &&
                            items?.map((item) => (
                                <div
                                    key={item.id}
                                    className={css.item}
                                    onClick={() => handleItemClick(item.id)}
                                >
                                    <div>
                                        <CheckBoxField
                                            value={localSelectedItemIds.includes(
                                                item.id,
                                            )}
                                        />
                                    </div>
                                    {hasImages && (
                                        <div>
                                            {item.img ? (
                                                <img
                                                    className={css.itemImage}
                                                    src={item.img}
                                                    alt={item.title}
                                                />
                                            ) : (
                                                <div
                                                    className={
                                                        css.itemImagePlaceholder
                                                    }
                                                />
                                            )}
                                        </div>
                                    )}
                                    <div className={css.itemTitle}>
                                        {item.title}
                                    </div>
                                    {item.status === 'draft' && (
                                        <div>
                                            <DraftBadge
                                                type={type}
                                                variant="selection-drawer"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </Drawer.Content>

            <Drawer.Footer>
                <div className={css.footerContainer}>
                    <div>
                        <IconButton
                            size="small"
                            fillStyle="ghost"
                            className={
                                pagination.hasPrevPage
                                    ? css.iconButton
                                    : undefined
                            }
                            onClick={pagination.onPrevClick}
                            aria-label="Previous page"
                            icon="chevron_left"
                            isDisabled={isLoading || !pagination.hasPrevPage}
                        />

                        <IconButton
                            size="small"
                            fillStyle="ghost"
                            className={
                                pagination.hasNextPage
                                    ? css.iconButton
                                    : undefined
                            }
                            onClick={pagination.onNextClick}
                            aria-label="Next page"
                            icon="chevron_right"
                            isDisabled={isLoading || !pagination.hasNextPage}
                        />
                    </div>

                    <div>
                        <Button
                            onClick={onClose}
                            intent="secondary"
                            size="medium"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={async () => {
                                setIsSubmitting(true)

                                try {
                                    await onSubmit(localSelectedItemIds)
                                    onClose()

                                    void dispatch(
                                        notify({
                                            message:
                                                'Product recommendations saved.',
                                            status: NotificationStatus.Success,
                                        }),
                                    )
                                } catch {
                                    void dispatch(
                                        notify({
                                            message:
                                                'Failed to save product recommendations.',
                                            status: NotificationStatus.Error,
                                        }),
                                    )
                                }

                                setIsSubmitting(false)
                            }}
                            intent="primary"
                            type="submit"
                            isDisabled={isSubmitting}
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </Drawer.Footer>
        </Drawer>
    )
}
