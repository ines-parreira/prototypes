import React, {ReactNode} from 'react'
import {useHistory} from 'react-router-dom'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'

import SelfServicePreviewChannelSelect from './SelfServicePreviewChannelSelect'

import css from './SelfServicePreviewContainer.less'

type Props<T extends SelfServiceChannel> = {
    channel?: T
    onChange?: (channel?: T) => void
    channels?: T[]
    alert?: {
        message: ReactNode
        action?: {message: string; href: string}
    }
    children: (channel: T) => void
}

const SelfServicePreviewContainer = <T extends SelfServiceChannel>({
    channel,
    onChange,
    channels,
    alert,
    children,
}: Props<T>) => {
    const history = useHistory()

    const alertAction = alert?.action

    return (
        <div className={css.container}>
            <div className={css.contentContainer}>
                <div className={css.content}>
                    {channels && onChange && (
                        <div className={css.controlsContainer}>
                            <SelfServicePreviewChannelSelect
                                channel={channel}
                                channels={channels}
                                onChange={onChange}
                            />
                        </div>
                    )}
                    {channel
                        ? children(channel)
                        : alert && (
                              <Alert
                                  className={css.alert}
                                  type={AlertType.Warning}
                                  icon
                                  customActions={
                                      alertAction && (
                                          <Button
                                              fillStyle="ghost"
                                              size="small"
                                              onClick={() => {
                                                  history.push(alertAction.href)
                                              }}
                                          >
                                              {alertAction.message}
                                          </Button>
                                      )
                                  }
                              >
                                  {alert.message}
                              </Alert>
                          )}
                </div>
            </div>
        </div>
    )
}

export default SelfServicePreviewContainer
