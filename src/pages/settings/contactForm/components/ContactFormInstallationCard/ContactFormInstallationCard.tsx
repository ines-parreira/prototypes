import classNames from 'classnames'
import React, {useState} from 'react'
import {Card, CardBody, CardHeader, Collapse} from 'reactstrap'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import CodeSnippet from 'pages/common/components/CodeSnippet'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import css from './ContactFormInstalationCard.less'

type Props = {
    title: string
    description: string
    instructions: string[]
    alert: string
    code: string
}

export function ContactFormInstallationCard({
    title,
    code,
    instructions,
    alert,
    description,
}: Props) {
    const [isOpen, setIsOpen] = useState(true)

    const toggleIsOpen = () => setIsOpen(!isOpen)

    return (
        <Card className={css.card}>
            <CardHeader className={css.cardHeader}>
                <div>
                    <h3 className={contactFormCss.mbXs}>{title}</h3>
                    <p dangerouslySetInnerHTML={{__html: description}} />
                </div>
                <button
                    onClick={toggleIsOpen}
                    aria-label={isOpen ? 'collapse card' : 'expand card'}
                >
                    <i className={`material-icons`}>
                        {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </i>
                </button>
            </CardHeader>

            <Collapse isOpen={isOpen}>
                <CardBody className={css.cardBody}>
                    <div
                        className={classNames(css.wrapper, contactFormCss.mbM)}
                    >
                        {instructions.map((instruction, index) => {
                            return (
                                <div key={index} className={css.instruction}>
                                    <div>
                                        <div
                                            className={
                                                css['instruction-number']
                                            }
                                        >
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div>{instruction}</div>
                                </div>
                            )
                        })}
                    </div>

                    <Alert
                        type={AlertType.Warning}
                        className={contactFormCss.mbM}
                    >
                        <span dangerouslySetInnerHTML={{__html: alert}} />
                    </Alert>

                    <CodeSnippet code={code} />
                </CardBody>
            </Collapse>
        </Card>
    )
}

export default ContactFormInstallationCard
