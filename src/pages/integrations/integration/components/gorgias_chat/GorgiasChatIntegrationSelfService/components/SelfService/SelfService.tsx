import React from 'react'
import classnames from 'classnames'

import {Link} from 'react-router-dom'
import {Label} from 'reactstrap'

import ToggleInput from 'pages/common/forms/ToggleInput'
import Tooltip from 'pages/common/components/Tooltip'

import css from './SelfService.less'

type SelfServiceProps = {
    isEnabled?: boolean
    isDisabled?: boolean
    isForcedDisabled?: boolean
    onChange: () => void
}

const SelfService = ({
    isEnabled = false,
    isDisabled = false,
    isForcedDisabled = false,
    onChange,
}: SelfServiceProps): JSX.Element => {
    return (
        <>
            <h3>Enable Self-service</h3>
            <p>
                Enabling{' '}
                <Link to="/app/settings/self-service">self-service</Link> will
                let your customers track their orders, request a return or
                cancellation and report issues they might have with an order. It
                will then create a chat ticket for your team.
            </p>
            <div className="d-flex my-4">
                <span id="toggle-button">
                    <ToggleInput
                        isToggled={isEnabled}
                        isDisabled={isDisabled}
                        onClick={onChange}
                    />
                </span>
                {isForcedDisabled ? (
                    <Tooltip
                        autohide={false}
                        placement="top"
                        delay={{show: 200, hide: 300}}
                        target="toggle-button"
                        style={{
                            textAlign: 'left',
                            width: 220,
                        }}
                    >
                        Self-service must be first enabled for this store before
                        you can enable it for this chat integration.
                        <br />
                        <Link to="/app/settings/self-service">
                            Click here to enable.
                        </Link>
                    </Tooltip>
                ) : null}
                <Label className="control-label ml-2" onClick={onChange}>
                    <p
                        className={classnames(
                            css['enable-self-service-label'],
                            isForcedDisabled ? css['force-disabled'] : undefined
                        )}
                    >
                        Enable self-service for this chat
                    </p>
                </Label>
            </div>
        </>
    )
}

export default SelfService
