import React, {useState} from 'react'
import Draggable from 'react-draggable'
import Modal from 'pages/common/components/Modal'
import Button from 'pages/common/components/button/Button'

import css from './ImageRepositioningModal.less'

type Props = {
    localImage?: File
    closeModal: () => void
    onSubmit: (offset: number) => void
    bannerInputRef: React.RefObject<HTMLInputElement>
}

export const MAX_ABSOLUTE_OFFSET = 50
// how fast is the image repositioning, the higher the slower
export const PIXEL_TO_OFFSET_RATIO = 3

export const ImageRepositioningModal = ({
    onSubmit,
    localImage,
    closeModal,
    bannerInputRef,
}: Props) => {
    const [top, setTop] = useState(0)
    const [offset, setOffset] = useState(0)

    const onCloseModal = () => {
        closeModal()
        setTop(0)
        setOffset(0)
    }

    return (
        <Modal
            isOpen={localImage !== undefined}
            className={css['modal-centered']}
            bodyClassName={css['modalBody']}
            header={'Banner Background'}
            onClose={onCloseModal}
            footerClassName={css.footerWrapper}
            footer={
                <>
                    <Button
                        intent="secondary"
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                    >
                        Replace Image
                    </Button>
                    <div className={css.actionButtonsContainer}>
                        <Button
                            intent="secondary"
                            type="button"
                            onClick={onCloseModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            intent="primary"
                            type="button"
                            onClick={() => {
                                onSubmit(offset)
                                onCloseModal()
                            }}
                        >
                            Save Image
                        </Button>
                    </div>
                </>
            }
        >
            <div className={css.container}>
                <img
                    src={localImage ? URL.createObjectURL(localImage) : ''}
                    alt=""
                    className={css.image}
                    style={{objectPosition: `center ${50 - offset}%`}}
                />
                <Draggable
                    axis="y"
                    handle=".handle"
                    defaultPosition={{x: 0, y: 0}}
                    grid={[PIXEL_TO_OFFSET_RATIO, PIXEL_TO_OFFSET_RATIO]}
                    scale={1}
                    onDrag={(_, data) => {
                        const {y} = data
                        setTop(y)
                        const dividedY = y / PIXEL_TO_OFFSET_RATIO
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
                            className={css.boundingBox}
                            style={{top: `${0 - top}px`}}
                        >
                            <p className={css.tooltip}>
                                Drag image to reposition
                            </p>
                        </div>
                    </div>
                </Draggable>
            </div>
        </Modal>
    )
}
