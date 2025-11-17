import React from 'react'

import { Link } from 'react-router-dom'

import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import Alert from 'pages/common/components/Alert/Alert'

import css from './AiAgentActivationStoreCard.less'

type Props = {
    alerts: StoreActivation['alerts']
    closeModal: () => void
}

export const AiAgentActivationStoreCardAlert = ({
    alerts,
    closeModal,
}: Props) => {
    return (
        <>
            {alerts?.map((alert) => (
                <Alert
                    key={`${name}_${alert.kind.description}`}
                    className={css.alert}
                    type={alert.type}
                    icon
                    customActions={
                        alert.cta
                            ? [
                                  alert.cta.to ? (
                                      <Link
                                          key="cta"
                                          className={css.alertCta}
                                          to={alert.cta.to}
                                          onClick={closeModal}
                                      >
                                          {alert.cta.label}
                                      </Link>
                                  ) : (
                                      <span
                                          key="cta"
                                          className={css.alertCta}
                                          onClick={alert.cta.onClick}
                                      >
                                          {alert.cta.label}
                                      </span>
                                  ),
                              ]
                            : undefined
                    }
                >
                    {alert.message}
                </Alert>
            ))}
        </>
    )
}
