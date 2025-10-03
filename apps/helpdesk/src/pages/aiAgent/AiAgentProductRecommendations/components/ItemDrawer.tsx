import { useEffect, useRef, useState } from 'react'

import { useDebouncedEffect } from '@repo/hooks'
import classNames from 'classnames'

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

import css from './ItemDrawer.less'

export const ItemDrawer = ({
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
    onShowProducts,
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
    onSubmit?: (itemsIds: string[]) => Promise<void>
    onSearch?: (searchTerm: string) => void
    onShowProducts?: (id: string) => void
}) => {
    const dispatch = useAppDispatch()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [localSearchTerm, setLocalSearchTerm] = useState('')
    const [localSelectedItemIds, setLocalSelectedItemIds] =
        useState(selectedItemIds)
    const itemsContainerRef = useRef<HTMLDivElement | null>(null)

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
            if (!onSearch) return
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

    const scrollItemsToTop = () => {
        if (itemsContainerRef.current) {
            itemsContainerRef.current.scrollTop = 0
        }
    }

    return (
        <Drawer
            fullscreen={false}
            isLoading={false}
            aria-label={title}
            open={isOpen}
            portalRootId="app-root"
            onBackdropClick={onClose}
            withFooter={onSubmit !== undefined}
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
                    {onSearch && (
                        <div className={css.searchBar}>
                            <SearchBar
                                placeholder={`Search ${itemLabelPlural}`}
                                onChange={setLocalSearchTerm}
                                value={localSearchTerm}
                            />
                        </div>
                    )}

                    <div ref={itemsContainerRef} className={css.items}>
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
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    className={classNames(css.item, {
                                        [css.itemHover]: !!onSubmit,
                                    })}
                                    onClick={
                                        onSubmit
                                            ? () => handleItemClick(item.id)
                                            : undefined
                                    }
                                >
                                    {onSubmit && (
                                        <div>
                                            <CheckBoxField
                                                value={localSelectedItemIds.includes(
                                                    item.id,
                                                )}
                                            />
                                        </div>
                                    )}
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
                                    {onShowProducts && (
                                        <IconButton
                                            size="medium"
                                            fillStyle="ghost"
                                            className={css.iconButton}
                                            onClick={(
                                                e: React.MouseEvent<HTMLButtonElement>,
                                            ) => {
                                                e.stopPropagation()
                                                onShowProducts(item.id)
                                            }}
                                            aria-label="Show products"
                                            icon="keyboard_arrow_right"
                                        />
                                    )}
                                </div>
                            ))}

                        {!isLoading &&
                            (pagination.hasPrevPage ||
                                pagination.hasNextPage) && (
                                <div className={css.pagination}>
                                    <IconButton
                                        fillStyle="fill"
                                        intent="secondary"
                                        className={
                                            pagination.hasPrevPage
                                                ? css.iconButton
                                                : undefined
                                        }
                                        onClick={() => {
                                            scrollItemsToTop()
                                            pagination.onPrevClick()
                                        }}
                                        aria-label="Previous page"
                                        icon="chevron_left"
                                        isDisabled={
                                            isLoading || !pagination.hasPrevPage
                                        }
                                    />

                                    <IconButton
                                        fillStyle="fill"
                                        intent="secondary"
                                        className={
                                            pagination.hasNextPage
                                                ? css.iconButton
                                                : undefined
                                        }
                                        onClick={() => {
                                            scrollItemsToTop()
                                            pagination.onNextClick()
                                        }}
                                        aria-label="Next page"
                                        icon="chevron_right"
                                        isDisabled={
                                            isLoading || !pagination.hasNextPage
                                        }
                                    />
                                </div>
                            )}
                    </div>
                </div>
            </Drawer.Content>

            {onSubmit && (
                <Drawer.Footer>
                    <div className={css.footerContainer}>
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
                            Save Changes
                        </Button>

                        <Button
                            onClick={onClose}
                            intent="secondary"
                            size="medium"
                            fillStyle="ghost"
                        >
                            Cancel
                        </Button>
                    </div>
                </Drawer.Footer>
            )}
        </Drawer>
    )
}
