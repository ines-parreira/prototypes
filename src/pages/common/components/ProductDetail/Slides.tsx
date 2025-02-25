import React, { ReactNode, useRef, useState } from 'react'

import classNames from 'classnames'
import Slider from 'react-slick'
import { Modal } from 'reactstrap'

import { useAppNode } from 'appNode'
import IconButton from 'pages/common/components/button/IconButton'
import { assetsUrl } from 'utils'

import { ProductDetail } from './types'

import css from './Detail.less'

export default function Slides(props: Pick<ProductDetail, 'screenshots'>) {
    const { screenshots = [] } = props
    const [isModalOpen, setModalOpen] = useState(false)
    const [initialSlide, setInitialSlide] = useState(0)
    const sliderRef = useRef<HTMLDivElement>(null)
    const appNode = useAppNode()

    return (
        <>
            <ul className={css.screenshotList}>
                {screenshots.map((screenshot, index) => (
                    <li className={css.screenshotListItem} key={index}>
                        <img
                            src={
                                screenshot.startsWith('http')
                                    ? screenshot
                                    : assetsUrl(screenshot)
                            }
                            alt={`Screenshot number ${
                                index + 1
                            } of things this products allows you to do in Gorgias`}
                            className={css.screenshot}
                            onClick={() => {
                                setInitialSlide(index)
                                setModalOpen(true)
                            }}
                        />
                    </li>
                ))}
            </ul>
            <Modal
                backdrop
                autoFocus={false}
                isOpen={isModalOpen}
                toggle={() => setModalOpen((isOpen) => !isOpen)}
                className={css.modal}
                external={
                    <IconButton
                        intent={'secondary'}
                        className={css.closeModalButton}
                        onClick={() => setModalOpen(false)}
                    >
                        close
                    </IconButton>
                }
                container={appNode ?? undefined}
            >
                <Slider
                    slidesToShow={1}
                    adaptiveHeight
                    infinite={false}
                    ref={(sliderInstance) => {
                        sliderInstance?.slickGoTo(initialSlide)
                    }}
                    // Ensure focus works even within a modal
                    onInit={() => sliderRef.current?.focus()}
                    prevArrow={
                        <SlideArrow isPrevious>
                            <IconButton intent={'secondary'}>
                                arrow_back_ios_new
                            </IconButton>
                        </SlideArrow>
                    }
                    nextArrow={
                        <SlideArrow>
                            <IconButton intent={'secondary'}>
                                arrow_forward_ios
                            </IconButton>
                        </SlideArrow>
                    }
                >
                    {screenshots.map((screenshot, index) => (
                        <div
                            key={index}
                            className={css.pictureContainer}
                            tabIndex={-1}
                            /**
                             * The only way I found to use a ref with the slider.
                             * It can only work without the infinite option. Otherwise
                             * we would have a ref pointing to several div.
                             **/
                            {...(index === 0 && {
                                ref: sliderRef,
                            })}
                        >
                            <img
                                className={css.sliderPicture}
                                alt={`Showcase number ${
                                    index + 1
                                } of things this product allows you to do in Gorgias`}
                                src={
                                    screenshot.startsWith('http')
                                        ? screenshot
                                        : assetsUrl(screenshot)
                                }
                            />
                        </div>
                    ))}
                </Slider>
            </Modal>
        </>
    )
}

function SlideArrow({
    className,
    isPrevious = false,
    onClick,
    children,
}: {
    className?: string
    isPrevious?: boolean
    onClick?: () => void
    children: ReactNode
}) {
    if (!onClick) return null
    return (
        <div
            className={classNames(className, css.slideArrow, {
                [css.slidePrev]: isPrevious,
                [css.slideNext]: !isPrevious,
            })}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
