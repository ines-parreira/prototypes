import React from 'react'

import {Button, Col, Row} from 'reactstrap'

import {isProduction} from '../../../../../../../utils/environment'

import Loader from '../../../../../../common/components/Loader/Loader'

import css from '../../CustomDomain.less'

type Props = {
    isLoading?: boolean
    status?: string
    onCheckStatus: () => void
}

export const HelpText = ({isLoading = false, status, onCheckStatus}: Props) => {
    if (!status || status === 'active') {
        return null
    }

    const dns = isProduction()
        ? 'clients.gorgias.help'
        : 'clients.gorgias.rehab'

    return (
        <>
            <div className={css.helpContainer} data-testid="domain-help">
                <p>
                    Visit the admin console of your domain registrar (the
                    website you bought your domain from) and create a CNAME
                    pointing to:
                </p>
                <p>
                    In your DNS manager, add a CNAME pointing to{' '}
                    <code>{dns}</code>
                </p>
            </div>
            <div>
                <Button
                    className="mr-4"
                    color="primary"
                    disabled={isLoading}
                    onClick={onCheckStatus}
                >
                    {isLoading ? (
                        <Row noGutters data-testid="icon-loading">
                            <Col className="mr-2">
                                <Loader minHeight="16px" size="16px" />
                            </Col>
                            <Col>Checking...</Col>
                        </Row>
                    ) : (
                        <>
                            <span className="material-icons mr-2">wifi</span>
                            Check Status
                        </>
                    )}
                </Button>
                <span>
                    NOTE: It may take up to a few hours for DNS changes to take
                    effect.
                </span>
            </div>
        </>
    )
}
