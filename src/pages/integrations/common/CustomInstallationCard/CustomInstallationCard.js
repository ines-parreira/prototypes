// @flow
import React, {type Node} from 'react'
import Clipboard from 'clipboard'
import classnames from 'classnames'
import {Alert, Button, Card, CardBody} from 'reactstrap'

import {FACEBOOK_INTEGRATION_TYPE} from '../../../../constants/integration'

import css from './CustomInstallationCard.less'


type Props = {
    integrationType: string,
    description: string | Node,
    code: string
}

type State = {
    isCopied: boolean
}

export default class CustomInstallationCard extends React.Component<Props, State> {
    state = {
        isCopied: false
    }

    clearIsCopiedTimeout: ?TimeoutID = null

    clipboard: ?Clipboard = null

    componentDidMount() {
        this.clipboard = new Clipboard('#copy-code-snippet')
        this.clipboard.on('success', () => {
            this.setState({isCopied: true})

            if (this.clearIsCopiedTimeout) {
                clearTimeout(this.clearIsCopiedTimeout)
            }

            this.clearIsCopiedTimeout = setTimeout(() => {
                this.setState({isCopied: false})
                this.clearIsCopiedTimeout = null
            }, 1500)
        })
    }

    componentWillUnmount() {
        if (this.clearIsCopiedTimeout) {
            clearTimeout(this.clearIsCopiedTimeout)
        }

        if (this.clipboard) {
            this.clipboard.destroy()
        }
    }

    render() {
        const {description, code, integrationType} = this.props

        return (
            <Card className={css['integration-card']}>
                <CardBody>
                    <div className={css['javascript-card-header']}>
                        <div className={css['logo-wrapper']}>
                            <img
                                alt="javascript-logo"
                                src={`${window.GORGIAS_ASSETS_URL || ''}/static/private/img/integrations/javascript.png`}
                            />
                        </div>
                        <div>
                            <h3>Javascript</h3>
                            <p>
                                {description}
                            </p>
                        </div>
                    </div>
                    <Alert className={css['code-wrapper']}>
                        <pre
                            id="code-snippet"
                            className={css.code}
                        >
                            {code}
                        </pre>
                    </Alert>
                </CardBody>
                <Button
                    id="copy-code-snippet"
                    type="button"
                    color="info"
                    className={classnames(css.copy, {'mr-4': integrationType === FACEBOOK_INTEGRATION_TYPE})}
                    data-clipboard-target="#code-snippet"
                >
                    <i className="material-icons-outlined mr-2">
                        file_copy
                    </i>
                    {this.state.isCopied ? 'Copied!' : 'Copy'}
                </Button>
            </Card>
        )
    }
}
