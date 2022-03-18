import classNames from 'classnames'
import React, {FunctionComponent, useState} from 'react'
import Draggable from 'react-draggable'

import {
    MAX_ABSOLUTE_OFFSET,
    PIXEL_TO_OFFSET_RATIO,
} from '../../../ImageRepositioningModal'

import imageRepositioningModalCss from '../../../ImageRepositioningModal/ImageRepositioningModal.less'
import css from '../../RepositionableImageUpload.less'

export type DraggablePreviewImageProps = {
    defaultPreview?: string
    verticalOffset?: number
    onSubmit: (offset: number) => void
    repositioningInProgress: boolean
    setRepositioningInProgress: (value: boolean) => void
    offset: number
    setOffset: (value: number) => void
    showActionButtons: boolean
    setShowActionButtons: (value: boolean) => void
}

export const DraggablePreviewImage: FunctionComponent<DraggablePreviewImageProps> =
    ({
        defaultPreview,
        verticalOffset = 0,
        onSubmit,
        repositioningInProgress,
        setRepositioningInProgress,
        offset,
        setOffset,
        showActionButtons,
        setShowActionButtons,
    }: DraggablePreviewImageProps) => {
        const [top, setTop] = useState(0)

        return (
            <>
                <div
                    className={classNames(css.imageContainer, {
                        [css.repositioning]: repositioningInProgress,
                    })}
                    onMouseEnter={() => setShowActionButtons(true)}
                    onMouseLeave={() => setShowActionButtons(false)}
                    data-testid="draggable-container"
                >
                    <img
                        className={classNames(
                            imageRepositioningModalCss.image,
                            css.image
                        )}
                        alt={defaultPreview}
                        src={defaultPreview}
                        style={{
                            objectPosition: `center ${50 - offset}%`,
                        }}
                    />
                    {(showActionButtons || repositioningInProgress) && (
                        <div
                            className={classNames({
                                [css.actionButtonContainer]: true,
                                [css.actionButtonContainerRepositioning]:
                                    repositioningInProgress,
                            })}
                        >
                            {!repositioningInProgress && (
                                <span
                                    onClick={() => {
                                        setRepositioningInProgress(true)
                                    }}
                                    className={css.actionButton}
                                >
                                    Reposition
                                </span>
                            )}
                            {repositioningInProgress && (
                                <>
                                    <span
                                        onClick={() => {
                                            setRepositioningInProgress(false)
                                            setTop(0)
                                            setOffset(verticalOffset)
                                        }}
                                        className={css.actionButton}
                                    >
                                        Cancel
                                    </span>
                                    <span
                                        onClick={() => {
                                            setRepositioningInProgress(false)
                                            setTop(0)
                                            onSubmit(Math.round(offset))
                                        }}
                                        className={css.actionButton}
                                    >
                                        Save Position
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                    {repositioningInProgress && (
                        <Draggable
                            axis="y"
                            handle=".handle"
                            defaultPosition={{x: 0, y: 0}}
                            grid={[
                                PIXEL_TO_OFFSET_RATIO,
                                PIXEL_TO_OFFSET_RATIO,
                            ]}
                            scale={1}
                            onDrag={(_, data) => {
                                const {y} = data
                                setTop(y)
                                const dividedY =
                                    y / PIXEL_TO_OFFSET_RATIO + verticalOffset
                                setOffset(
                                    dividedY > MAX_ABSOLUTE_OFFSET
                                        ? MAX_ABSOLUTE_OFFSET
                                        : dividedY < -MAX_ABSOLUTE_OFFSET
                                        ? -MAX_ABSOLUTE_OFFSET
                                        : dividedY
                                )
                            }}
                        >
                            <div className="handle">
                                <div
                                    className={classNames(
                                        imageRepositioningModalCss.boundingBox,
                                        css.boundingBox
                                    )}
                                    style={{top: `${0 - top}px`}}
                                >
                                    <p
                                        className={
                                            imageRepositioningModalCss.tooltip
                                        }
                                    >
                                        Drag image to reposition
                                    </p>
                                </div>
                            </div>
                        </Draggable>
                    )}
                </div>
            </>
        )
    }
