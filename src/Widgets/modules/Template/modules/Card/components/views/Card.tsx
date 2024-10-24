import classnames from 'classnames'
import React, {ComponentProps, ReactNode, useState} from 'react'

import {CardEditFormState} from '../../types'
import css from './Card.less'
import CardEditForm from './CardEditForm'

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
    isDefaultOpen?: boolean
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
        shouldDisplayHeader,
        shouldDisplayContent,

        isEditionMode,
    } = props
    const [isOpen, setOpen] = useState(props.isDefaultOpen || false)
    const isOnlyContent = !props.cardData.displayCard

    const isExpandable =
        !isEditionMode && shouldDisplayHeader && shouldDisplayContent

    const className = classnames(css.card, {
        draggable: props.isDraggable,
        [css.closed]: !isOpen && !isEditionMode,
        [css.onlyContent]: !isEditionMode && isOnlyContent,
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
                            displayedTitle={props.displayedTitle}
                            dynamicLink={props.dynamicLink}
                            cardData={props.cardData}
                            editionHiddenFields={props.editionHiddenFields}
                            orderByOptions={props.orderByOptions}
                            isEditionMode={isEditionMode}
                            isExpandable={isExpandable}
                            isOpen={isOpen}
                            onToggleOpen={() => setOpen(!isOpen)}
                            onEditionStart={props.onEditionStart}
                            onEditionStop={props.onEditionStop}
                            onDelete={props.onDelete}
                            onSubmit={props.onSubmit}
                            renderTitleWrapper={renderTitleWrapper}
                        />
                        {props.customActions}
                        {afterTitle}
                    </>
                )}

                <div
                    className={classnames(css.cardContent, {
                        hidden: !shouldDisplayContent || !isOpen,
                        [css.canDrop]: isEditionMode && props.canDrop,
                    })}
                >
                    {beforeContent}
                    {props.children}
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
