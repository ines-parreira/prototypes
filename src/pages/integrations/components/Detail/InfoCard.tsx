import React from 'react'
import {Card, CardBody} from 'reactstrap'
import classNames from 'classnames'

import {IntegrationConfig} from 'config'
import {AppDetail, isAppDetail, PricingPlan} from 'models/integration/types/app'
import Button from 'pages/common/components/button/Button'

import css from './Detail.less'
import ConnectLink from './ConnectLink'

export default function InfoCard(
    props:
        | AppDetail
        | (IntegrationConfig & {
              connectUrl: string
              isExternalConnectUrl: boolean
              disabledMessage?: string
              isConnectionDisabled?: boolean
          })
) {
    const {
        title,
        company,
        privacyPolicy,
        pricingPlan,
        pricingDetails,
        setupGuide,
        connectUrl,
    } = props

    const pricing =
        pricingPlan === PricingPlan.FREE
            ? 'Free'
            : pricingDetails ||
              `Contact ${company || 'the company'} for pricing details.`

    const isDisabled = !isAppDetail(props) && props.isConnectionDisabled

    return (
        <Card className={css.infoCard}>
            <CardBody>
                <div className={css.connectWrapper}>
                    <ConnectLink
                        connectUrl={connectUrl}
                        isApp={isAppDetail(props)}
                        integrationTitle={title}
                        isExternal={
                            !isAppDetail(props) && props.isExternalConnectUrl
                        }
                        isDisabled={isDisabled}
                        disabledMessage={
                            (!isAppDetail(props) && props.disabledMessage) || ''
                        }
                    >
                        <Button
                            className={css.connectButton}
                            isDisabled={isDisabled}
                        >
                            Connect App
                        </Button>
                    </ConnectLink>
                </div>
                <h2 className={classNames(css.categoryTitle, css.cardTitle)}>
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
    )
}
