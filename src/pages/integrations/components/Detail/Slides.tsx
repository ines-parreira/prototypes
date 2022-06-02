import React, {ReactNode, useState, useRef} from 'react'
import {Modal} from 'reactstrap'
import classNames from 'classnames'
import Slider from 'react-slick'

import {AppDetail} from 'models/integration/types/app'
import IconButton from 'pages/common/components/button/IconButton'

import css from './Detail.less'

const imgPrefix = `${
    window.GORGIAS_ASSETS_URL || ''
}/static/private/js/assets/img/integrations/`

export default function Slides(
    props: Pick<AppDetail, 'screenshots'> & {isApp: boolean}
) {
    const {screenshots = [], isApp} = props
    const [isModalOpen, setModalOpen] = useState(false)
    const [initialSlide, setInitialSlide] = useState(0)
    const sliderRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <ul className={css.screenshotList}>
                {screenshots.map((src, index) => (
                    <li className={css.screenshotListItem} key={index}>
                        <img
                            src={isApp ? src : `${imgPrefix}screenshots/${src}`}
                            alt={`Screenshot number ${
                                index + 1
                            } of things this app allows you to do in Gorgias`}
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
                    {screenshots.map((url, index) => (
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
                                } of things this app allows you to do in Gorgias`}
                                src={
                                    isApp
                                        ? url
                                        : `${imgPrefix}screenshots/${url}`
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
