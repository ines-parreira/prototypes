import React, {useState} from 'react'

import {Link} from 'react-router-dom'
import Tooltip from 'pages/common/components/Tooltip'
import ConvertSubscriptionModal from 'pages/settings/new_billing/components/ConvertSubscriptionModal'
import css from './AdvancedTriggersTooltip.less'

type Props = {
    isConvertSubscriber?: boolean
}

export const AdvancedTriggersTooltip = ({
    isConvertSubscriber = false,
}: Props) => {
    const [isConvertModalOpened, setIsConvertModalOpened] = useState(false)

    const openModal = () => {
        setIsConvertModalOpened(true)
    }

    const closeModal = () => {
        setIsConvertModalOpened(false)
    }

    if (isConvertSubscriber === false) {
        return (
            <>
                <span
                    id="unlock-triggers-option"
                    onClick={openModal}
                    className={css.tooltipIcon}
                >
                    <i className="material-icons">info</i>
                </span>
                <Tooltip
                    placement="top-start"
                    target={'unlock-triggers-option'}
                    autohide={false}
                >
                    Unlock all conditions by subscribing to Convert.{' '}
                    <Link to="#" onClick={openModal} className={css.actionLink}>
                        Learn more
                    </Link>
                </Tooltip>
                <ConvertSubscriptionModal
                    canduId={'campaign-triggers-convert-modal-body'}
                    isOpen={isConvertModalOpened}
                    onClose={closeModal}
                    onSubscribe={closeModal}
                />
            </>
        )
    }

    return null
}
