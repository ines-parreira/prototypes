import React, {ReactNode, Component} from 'react'
import Clipboard from 'clipboard'
import classnames from 'classnames'
import {Alert, Card, CardBody} from 'reactstrap'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'
import {FACEBOOK_INTEGRATION_TYPE} from '../../../../constants/integration'

import css from './CustomInstallationCard.less'

type Props = {
    integrationType: string
    description: string | ReactNode
    code: string
}

type State = {
    isCopied: boolean
}

export default class CustomInstallationCard extends Component<Props, State> {
    state = {
        isCopied: false,
    }

    clearIsCopiedTimeout: number | null = null

    clipboard: Clipboard | null = null

    componentDidMount() {
        this.clipboard = new Clipboard('#copy-code-snippet')
        this.clipboard.on('success', () => {
            this.setState({isCopied: true})

            if (this.clearIsCopiedTimeout) {
                clearTimeout(this.clearIsCopiedTimeout)
            }

            this.clearIsCopiedTimeout = window.setTimeout(() => {
                this.setState({isCopied: false})
                this.clearIsCopiedTimeout = null
            }, 1500)
        })
    }

    componentWillUnmount() {
        if (this.clearIsCopiedTimeout) {
            window.clearTimeout(this.clearIsCopiedTimeout)
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
                                src={`${
                                    window.GORGIAS_ASSETS_URL || ''
                                }/static/private/js/assets/img/integrations/javascript.png`}
                            />
                        </div>
                        <div>
                            <h3>Javascript</h3>
                            {description}
                        </div>
                    </div>
                    <Alert className={css['code-wrapper']}>
                        <pre id="code-snippet" className={css.code}>
                            {code}
                        </pre>
                    </Alert>
                </CardBody>
                <Button
                    id="copy-code-snippet"
                    type="button"
                    className={classnames(css.copy, {
                        'mr-4': integrationType === FACEBOOK_INTEGRATION_TYPE,
                    })}
                    data-clipboard-target="#code-snippet"
                >
                    <ButtonIconLabel icon="file_copy" />
                    {this.state.isCopied ? 'Copied!' : 'Copy'}
                </Button>
            </Card>
        )
    }
}
