import React, {ReactNode, useState, useRef} from 'react'
import {Badge, Card, CardBody, Modal} from 'reactstrap'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import Slider from 'react-slick'

import {IntegrationConfig} from 'config'
import useAppSelector from 'hooks/useAppSelector'
import {
    AppDetail,
    isAppDetail,
    PricingPlan,
    TrialPeriod,
} from 'models/integration/types/app'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'

import css from './Detail.less'

const SCREENSHOTS_MAX_NUMBER = 3

function ConnectLink({
    connectUrl,
    isExternal,
    isApp,
    domain,
    children,
}: {
    connectUrl: string
    isApp: boolean
    isExternal?: boolean
    domain: string
    children: ReactNode
}) {
    let sanitizedConnectUrl = connectUrl
    // The modification below ensure we have proper query param to handle OAuth redirection
    if (isApp) {
        let url
        try {
            url = new URL(connectUrl)
        } catch (e) {
            url = new URL('https://docs.gorgias.com/')
        }
        url.searchParams.set('account', domain)
        sanitizedConnectUrl = url.toString()
    }
    return isApp || isExternal ? (
        <a
            href={sanitizedConnectUrl}
            className={css.actionLink}
            {...(isApp && {
                target: '_blank',
                rel: 'noopener noreferrer',
            })}
        >
            {children}
        </a>
    ) : (
        <Link to={connectUrl} className={css.actionLink}>
            {children}
        </Link>
    )
}

export default function Detail(props: AppDetail | IntegrationConfig) {
    const {
        image,
        title,
        description,
        categories = [],
        company,
        companyUrl,
        screenshots = [],
        longDescription,
        privacyPolicy,
        pricingPlan,
        hasFreeTrial,
        freeTrialPeriod,
        pricingDetails,
        setupGuide,
    } = props
    const [isModalOpen, setModalOpen] = useState(false)
    const [initialSlide, setInitialSlide] = useState(0)
    const sliderRef = useRef<HTMLDivElement>(null)
    const currentAccount = useAppSelector(getCurrentAccountState)

    const pricing =
        pricingPlan === PricingPlan.FREE
            ? 'Free'
            : pricingDetails ||
              `Contact ${company || 'the company'} for pricing details.`

    let trialLabel = 'Free trial'
    if (freeTrialPeriod && freeTrialPeriod !== TrialPeriod.CUSTOM) {
        trialLabel = freeTrialPeriod + ' free trial'
    }

    const maxedScreenshots = screenshots.slice(0, SCREENSHOTS_MAX_NUMBER)

    return (
        <>
            <header className={css.hero}>
                {image && (
                    <img
                        src={image}
                        alt={`${title}'s logo`}
                        className={css.heroImage}
                    />
                )}
                <div>
                    <h1 className={css.heroHeading}>{title}</h1>
                    <p className={css.heroDescription}>{description}</p>
                    <div className={css.heroMeta}>
                        {categories.length > 0 &&
                            categories.map((category, index) => (
                                <Badge
                                    key={index}
                                    color="secondary"
                                    pill
                                    className={css.badge}
                                >
                                    {category.toUpperCase()}
                                </Badge>
                            ))}
                        {hasFreeTrial && (
                            <Badge color="success" pill className={css.badge}>
                                {trialLabel.toUpperCase()}
                            </Badge>
                        )}
                        {company && companyUrl && (
                            <span className={css.by}>
                                by{' '}
                                <a
                                    href={companyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {company}
                                </a>
                            </span>
                        )}
                    </div>
                </div>
            </header>
            <main className={css.main}>
                <section className={css.longDescription}>
                    <h2 className={css.categoryTitle}>About</h2>
                    <div dangerouslySetInnerHTML={{__html: longDescription}} />
                    <ul className={css.screenshotList}>
                        {maxedScreenshots.map((src, index) => (
                            <li className={css.screenshotListItem} key={index}>
                                <img
                                    src={src}
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
                </section>
                <Card className={css.infoCard}>
                    <CardBody>
                        <ConnectLink
                            // TODO @Manuel: Remove this typeguad when integration details are available too
                            connectUrl={
                                (isAppDetail(props) && props.connectUrl) || ''
                            }
                            isApp={isAppDetail(props)}
                            domain={currentAccount.get('domain')}
                            isExternal={
                                !isAppDetail(props) &&
                                props.isExternalConnectUrl
                            }
                        >
                            <Button className={css.actionButton}>
                                Connect App
                            </Button>
                        </ConnectLink>
                        <h2
                            className={classNames(
                                css.categoryTitle,
                                css.cardTitle
                            )}
                        >
                            Pricing
                        </h2>
                        <div dangerouslySetInnerHTML={{__html: pricing}} />
                        {(setupGuide || privacyPolicy) && (
                            <>
                                <h2
                                    className={classNames(
                                        css.categoryTitle,
                                        css.cardTitle
                                    )}
                                >
                                    Resources
                                </h2>
                                <ul className={css.cardList}>
                                    {setupGuide && (
                                        <li>
                                            <a
                                                href={setupGuide}
                                                className={css.actionLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i
                                                    className={classNames(
                                                        'material-icons-outlined',
                                                        css.actionIcon,
                                                        css.actionIconBigger
                                                    )}
                                                >
                                                    description
                                                </i>
                                                Documentation
                                            </a>
                                        </li>
                                    )}
                                    {privacyPolicy && (
                                        <li>
                                            <a
                                                href={privacyPolicy}
                                                className={css.actionLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i
                                                    className={classNames(
                                                        'material-icons-outlined',
                                                        css.actionIcon,
                                                        css.actionIconBigger
                                                    )}
                                                >
                                                    privacy_tip
                                                </i>
                                                Privacy Policy
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </>
                        )}
                        {isAppDetail(props) &&
                            (props.supportEmail || props.supportPhone) && (
                                <>
                                    <h2
                                        className={classNames(
                                            css.categoryTitle,
                                            css.cardTitle
                                        )}
                                    >
                                        Support
                                    </h2>
                                    <ul className={css.cardList}>
                                        {props.supportEmail && (
                                            <li>
                                                <a
                                                    href={`mailto:${props.supportEmail}`}
                                                    className={css.actionLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <i
                                                        className={classNames(
                                                            'material-icons',
                                                            css.actionIcon
                                                        )}
                                                    >
                                                        mail
                                                    </i>
                                                    {props.supportEmail}
                                                </a>
                                            </li>
                                        )}
                                        {props.supportPhone && (
                                            <li>
                                                <a
                                                    href={`tel:${props.supportPhone}`}
                                                    className={css.actionLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <i
                                                        className={classNames(
                                                            'material-icons',
                                                            css.actionIcon
                                                        )}
                                                    >
                                                        phone
                                                    </i>
                                                    {props.supportPhone}
                                                </a>
                                            </li>
                                        )}
                                    </ul>
                                </>
                            )}
                    </CardBody>
                </Card>
            </main>
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
                    {maxedScreenshots.map((url, index) => (
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
                                src={url}
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
