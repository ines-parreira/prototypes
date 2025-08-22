import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import { logEvent } from 'common/segment'
import { assetsUrl } from 'utils'

import { getBannerDetails } from './utils'

import css from './FlowsBanner.less'

export type FlowsBannerProps = {
    isSubscribedToAutomation: boolean
    contactFormId: number
    shopName: string | null
}

const FlowsBanner = ({
    isSubscribedToAutomation,
    contactFormId,
    shopName,
}: FlowsBannerProps): JSX.Element => {
    const { title, description, button, track } = getBannerDetails(
        isSubscribedToAutomation,
        contactFormId,
        shopName,
    )
    const history = useHistory()

    const onClick = () => {
        logEvent(track)
        history.push(button.link)
    }

    return (
        <div className={css.container}>
            <div className={css.content}>
                <div className={css.text}>
                    <div className={css.title}>{title}</div>
                    {!!description && (
                        <div className={css.description}>{description}</div>
                    )}
                </div>
                <Button
                    intent="primary"
                    onClick={onClick}
                    className={css.button}
                >
                    {button.icon && (
                        <i className="material-icons">{button.icon}</i>
                    )}
                    <div>{button.text}</div>
                </Button>
            </div>
            <div>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    src={assetsUrl(`/img/contact-form/flows-banner.mp4`)}
                    className={css.video}
                />
            </div>
        </div>
    )
}

export default FlowsBanner
