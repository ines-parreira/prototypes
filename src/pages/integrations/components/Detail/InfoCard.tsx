import React, {useState} from 'react'
import {Card, CardBody} from 'reactstrap'
import classNames from 'classnames'

import {IntegrationConfig} from 'config'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {notify} from 'state/notifications/actions'
import BannerNotification, {
    Props as BannerProps,
} from 'pages/common/components/BannerNotifications/BannerNotification'
import {NotificationStatus} from 'state/notifications/types'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {AppDetail, isAppDetail, PricingPlan} from 'models/integration/types/app'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {disconnectApp} from 'models/integration/resources'

import css from './Detail.less'
import ConnectLink from './ConnectLink'

export default function InfoCard(
    props:
        | AppDetail
        | (IntegrationConfig & {
              connectUrl: string
              connectTitle?: string
              isExternalConnectUrl: boolean
              notification?: BannerProps
              isConnectionDisabled?: boolean
          })
) {
    const {
        title,
        company,
        privacyPolicy,
        pricingLink,
        pricingPlan,
        pricingDetails,
        setupGuide,
        connectUrl,
    } = props
    const dispatch = useAppDispatch()
    const domain = useAppSelector(getCurrentAccountState).get('domain')
    const [isLoading, setLoading] = useState(false)
    const [isAppInstalled, setAppInstalled] = useState<boolean>(
        isAppDetail(props) && props.isConnected
    )
    const [isModalOpen, setModalOpen] = useState(false)

    const pricing =
        pricingPlan === PricingPlan.FREE
            ? 'Free'
            : pricingDetails ||
              `Contact ${company || 'the company'} for pricing details.`

    let isDisabled = false
    let disabledMessage = ''

    if (!isAppDetail(props)) {
        isDisabled = props.isConnectionDisabled || false
        disabledMessage = props.notification?.message || ''
    }

    const handleIntegrationDisconnection = async () => {
        if (!isAppDetail(props)) return

        logEvent(SegmentEvent.IntegrationDisconnectClicked, {
            integration: title.toLowerCase(),
            is_openchannel_app: true,
            account_domain: domain,
        })
        setLoading(true)
        try {
            const isUninstalled = await disconnectApp(props.appId)
            if (isUninstalled) {
                setAppInstalled(!isUninstalled)
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `${title} has been disconnected.`,
                    })
                )
            } else {
                throw new Error(`Not disconnected`)
            }
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `Sorry, something went wrong. ${title} is still connected.`,
                })
            )
        } finally {
            setModalOpen(false)
            setLoading(false)
        }
    }

    return (
        <Card className={css.infoCard}>
            {isAppDetail(props) && props.isUnapproved && (
                <div className={css.rounderWrapper}>
                    <BannerNotification
                        status={NotificationStatus.Warning}
                        allowHTML
                        message="<strong>This app has not been approved by Gorgias.</strong><br />We approve apps to ensure your security, be sure
                        that you trust this app before granting it
                        access."
                        showIcon
                        dismissible={false}
                    />
                </div>
            )}
            <CardBody>
                <div className={css.connectWrapper}>
                    {isAppInstalled ? (
                        <Button
                            intent="destructive"
                            className={css.actionButton}
                            onClick={() => setModalOpen(true)}
                        >
                            Disconnect App
                        </Button>
                    ) : (
                        <ConnectLink
                            connectUrl={connectUrl}
                            isApp={isAppDetail(props)}
                            integrationTitle={title}
                            isExternal={
                                !isAppDetail(props) &&
                                props.isExternalConnectUrl
                            }
                            isDisabled={isDisabled}
                            disabledMessage={disabledMessage}
                        >
                            {isAppDetail(props)}
                            <Button
                                className={css.actionButton}
                                isDisabled={isDisabled}
                            >
                                {isAppDetail(props) &&
                                    (props.isUnapproved
                                        ? 'Connect Unapproved App'
                                        : 'Connect App')}
                                {!isAppDetail(props) &&
                                    (props.connectTitle
                                        ? props.connectTitle
                                        : 'Connect App')}
                            </Button>
                        </ConnectLink>
                    )}
                </div>
                <h2 className={classNames(css.categoryTitle, css.cardTitle)}>
                    Pricing
                </h2>
                {(pricing || pricingDetails) && (
                    <ul className={css.cardList}>
                        {pricing && (
                            <li dangerouslySetInnerHTML={{__html: pricing}} />
                        )}
                        {pricingLink && (
                            <li>
                                <a
                                    href={pricingLink}
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
                                        attach_money
                                    </i>
                                    See pricing details
                                </a>
                            </li>
                        )}
                    </ul>
                )}
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
                {(props.supportEmail || props.supportPhone) && (
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
            <Modal
                onClose={() => setModalOpen(false)}
                isOpen={isModalOpen}
                size="small"
            >
                <ModalHeader title={`Disconnect ${title}?`} />
                <ModalBody>
                    <p>
                        Disconnecting the app revokes its permission to send or
                        receive your Gorgias data.
                    </p>
                </ModalBody>
                <ModalActionsFooter>
                    <Button
                        intent="secondary"
                        isDisabled={isLoading}
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="destructive"
                        isLoading={isLoading}
                        onClick={handleIntegrationDisconnection}
                    >
                        {isLoading ? 'Disconnecting' : 'Disconnect'}
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </Card>
    )
}
