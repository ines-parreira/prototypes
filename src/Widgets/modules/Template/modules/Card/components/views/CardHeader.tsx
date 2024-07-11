import React, {ComponentProps, SyntheticEvent, ReactNode, useState} from 'react'
import {Popover, PopoverBody} from 'reactstrap'
import classnames from 'classnames'

import {useAppNode} from 'appNode'
import useId from 'hooks/useId'
import {CardHeaderIcon} from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderIcon'
import CardEditForm from 'Widgets/modules/Template/modules/Card/components/views/CardEditForm'
import {CardEditFormState} from 'Widgets/modules/Template/modules/Card/types'
import {
    EXPAND_TARGET_MARKER,
    TARGET_CLOSED_MARKER,
} from 'Widgets/modules/Template/config/template'

import css from './CardHeader.less'

export const EDIT_BUTTON_TEXT = 'edit'
export const DELETE_BUTTON_TEXT = 'delete'

type CardEditFormProps = ComponentProps<typeof CardEditForm>

type TitleProps = {
    cardData: CardEditFormProps['initialData']
    displayedTitle: ReactNode
    dynamicLink?: string
    isEditionMode: boolean
    renderTitleWrapper: (children: ReactNode) => JSX.Element | null
}
const Title = ({
    cardData,
    displayedTitle,
    dynamicLink,
    isEditionMode,
    renderTitleWrapper,
}: TitleProps) => {
    const pictureUrl = cardData.pictureUrl
    const color = cardData.color

    let content = displayedTitle
    if (isEditionMode) {
        content = content || (
            <span className={css.cardHeaderPlaceholder}>Title</span>
        )
    }

    const titleWrapper = renderTitleWrapper(content)
    if (titleWrapper) {
        content = titleWrapper
    } else {
        if (dynamicLink) {
            content = (
                <a href={dynamicLink} target="_blank" rel="noopener noreferrer">
                    {content}
                </a>
            )
        }
        content = (
            <>
                {color && !pictureUrl ? (
                    <div
                        className={css.colorTile}
                        style={{
                            backgroundColor: color,
                        }}
                    />
                ) : (
                    pictureUrl && (
                        <CardHeaderIcon
                            src={pictureUrl}
                            alt={'Widget Icon'}
                            color={color}
                        />
                    )
                )}
                {content}
            </>
        )
    }

    return <>{content}</>
}

type CardHeaderProps = {
    displayedTitle: ReactNode
    dynamicLink?: string
    cardData: CardEditFormProps['initialData']
    editionHiddenFields: CardEditFormProps['hiddenFields']
    orderByOptions: CardEditFormProps['orderByOptions']
    isEditionMode: boolean
    isExpandable: boolean
    onDelete: () => void
    onEditionStart: () => void
    onEditionStop: () => void
    onSubmit: (formData: CardEditFormState) => void
    isOpen: boolean
    onToggleOpen: () => void
    renderTitleWrapper: (children: ReactNode) => JSX.Element | null
}

export default function CardHeader(props: CardHeaderProps) {
    const {
        displayedTitle,
        dynamicLink,
        cardData,
        editionHiddenFields,
        orderByOptions,
        isEditionMode,
        isExpandable,
        onDelete,
        onEditionStart,
        onEditionStop,
        onSubmit,
        renderTitleWrapper,
        isOpen,
        onToggleOpen,
    } = props
    const appNode = useAppNode()

    const [isPopupOpen, setPopupOpen] = useState(false)

    const isOnlyContent = !cardData.displayCard
    const uniqueId = `card-widget-${useId()}`

    const handleDelete = (e?: SyntheticEvent) => {
        e?.stopPropagation()
        onDelete()
    }

    const handleEditStart = (e?: SyntheticEvent) => {
        e?.stopPropagation()

        setPopupOpen(true)
        onEditionStart()
    }

    const handleEditStop = (e?: SyntheticEvent) => {
        e?.stopPropagation()
        setPopupOpen(false)
        onEditionStop()
    }

    const handlePopoverToggle = () => {
        if (isPopupOpen) {
            handleEditStop()
        }
    }

    const handleEditSubmit = (formState: CardEditFormState) => {
        onSubmit(formState)
        onEditionStop()
        setPopupOpen(false)
    }

    return (
        <div className={css.cardHeader} id={uniqueId}>
            {isExpandable && (
                <span
                    {...{
                        [EXPAND_TARGET_MARKER]: true,
                        [TARGET_CLOSED_MARKER]: !isOpen,
                    }}
                    className={classnames(
                        css.dropdownIcon,
                        'clickable',
                        'text-faded'
                    )}
                    onClick={onToggleOpen}
                    title={isOpen ? 'Fold this card' : 'Unfold this card'}
                >
                    {isOpen ? (
                        <i className="material-icons">expand_less</i>
                    ) : (
                        <i className="material-icons">expand_more</i>
                    )}
                </span>
            )}
            {isEditionMode && (
                <>
                    <span className={css.cardTools}>
                        <i
                            className={`material-icons text-danger ${css.cardToolIcon}`}
                            onClick={handleDelete}
                        >
                            {DELETE_BUTTON_TEXT}
                        </i>
                        <i
                            className={`material-icons ${css.cardToolIcon}`}
                            onClick={handleEditStart}
                        >
                            {EDIT_BUTTON_TEXT}
                        </i>
                    </span>
                    {isOnlyContent && (
                        <div className={css.onlyContentIndicator}>
                            Hidden card
                        </div>
                    )}
                    <Popover
                        placement="left"
                        isOpen={isPopupOpen}
                        target={uniqueId}
                        toggle={handlePopoverToggle}
                        trigger="legacy"
                        container={appNode ?? undefined}
                    >
                        <PopoverBody>
                            <CardEditForm
                                initialData={cardData}
                                orderByOptions={orderByOptions}
                                hiddenFields={editionHiddenFields}
                                onSubmit={handleEditSubmit}
                                onCancel={handleEditStop}
                            />
                        </PopoverBody>
                    </Popover>
                </>
            )}
            <Title
                cardData={cardData}
                displayedTitle={displayedTitle}
                dynamicLink={dynamicLink}
                isEditionMode={isEditionMode}
                renderTitleWrapper={renderTitleWrapper}
            />
        </div>
    )
}
