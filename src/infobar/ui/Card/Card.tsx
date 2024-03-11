import React, {ComponentProps, ReactNode, useState} from 'react'
import classnames from 'classnames'

import CardEditForm, {CardEditFormState} from 'infobar/ui/Card/CardEditForm'

import css from './Card.less'
import CardHeader from './CardHeader'

type CardEditFormProps = ComponentProps<typeof CardEditForm>

type Props = {
    extensions: {
        afterTitle: ReactNode
        beforeContent: ReactNode
        afterContent: ReactNode
        renderTitleWrapper: (children: ReactNode) => JSX.Element | null
        renderWrapper: (children: ReactNode) => JSX.Element | null
    }
    editionHiddenFields: CardEditFormProps['hiddenFields']

    customActions: ReactNode
    displayedTitle: ReactNode
    dynamicLink?: string
    cardData: CardEditFormProps['initialData']
    orderByOptions: CardEditFormProps['orderByOptions']
    shouldDisplayHeader: boolean
    shouldDisplayContent: boolean

    onEditionStart: () => void
    onEditionStop: () => void
    onSubmit: (formData: CardEditFormState) => void
    onDelete: () => void

    children: ReactNode
    isEditionMode: boolean
    canDrop: boolean
    isDraggable: boolean
    isOpen: boolean
    hasNoBorderTop: boolean
}

export default function Card(props: Props) {
    const {
        extensions: {
            afterTitle,
            beforeContent,
            afterContent,
            renderTitleWrapper,
            renderWrapper,
        },
        editionHiddenFields,

        customActions,

        displayedTitle,
        dynamicLink,
        cardData,
        orderByOptions,
        shouldDisplayHeader,
        shouldDisplayContent,

        onEditionStart,
        onEditionStop,
        onSubmit,
        onDelete,

        canDrop,
        isDraggable,
        children,
        isEditionMode,
        hasNoBorderTop,
    } = props
    const [isOpen, setOpen] = useState(props.isOpen)
    const isOnlyContent = !cardData.displayCard

    const isExpandable =
        !isEditionMode && shouldDisplayHeader && shouldDisplayContent
    // keep the unscoped class here to have drag and drop greying feature
    const className = classnames(css.card, 'widget-card', {
        'can-drop': isEditionMode && canDrop,
        draggable: isDraggable,
        [css.closed]: !isOpen && !isEditionMode,
        [css.onlyContent]: !isEditionMode && isOnlyContent,
        [css.removeBorderTop]: hasNoBorderTop,
    })

    let content = (
        <div className={className}>
            <div
                className={classnames(css.cardMarginWrapper, {
                    [css.onlyContent]: !isEditionMode && isOnlyContent,
                })}
            >
                {shouldDisplayHeader && (
                    <>
                        <CardHeader
                            displayedTitle={displayedTitle}
                            dynamicLink={dynamicLink}
                            cardData={cardData}
                            editionHiddenFields={editionHiddenFields}
                            orderByOptions={orderByOptions}
                            isEditionMode={isEditionMode}
                            isExpandable={isExpandable}
                            isOpen={isOpen}
                            onToggleOpen={() => setOpen(!isOpen)}
                            onEditionStart={onEditionStart}
                            onEditionStop={onEditionStop}
                            onDelete={onDelete}
                            onSubmit={onSubmit}
                            renderTitleWrapper={renderTitleWrapper}
                        />
                        {customActions}
                        {afterTitle}
                    </>
                )}
                <div
                    // keep the unscoped class here to have drag and drop greying feature
                    className={classnames(
                        'widget-card-content',
                        css.cardContent,
                        {
                            hidden: !shouldDisplayContent,
                        }
                    )}
                >
                    {beforeContent}
                    {children}
                    {afterContent}
                </div>
            </div>
        </div>
    )

    const wrapper = renderWrapper(content)
    if (wrapper) {
        content = wrapper
    }

    return content
}
