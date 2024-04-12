import React, {useState} from 'react'
import moment from 'moment'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'

import css from './RequestABTestModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    onSubmit: () => void
}

const RequestABTestModal = ({isOpen, onClose, onSubmit}: Props) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const formattedDate = moment.utc(moment(Date.now())).format('MMM D, YYYY')

    const submit = () => {
        setIsLoading(true)

        onSubmit()

        setIsLoading(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="large">
            <ModalBody className={css.modalBody}>
                <div className={css.modalContainer}>
                    <div className={css.leftSide}>
                        <h3 className={css.header}>Request an A/B test</h3>
                        <p>
                            Assess the effectiveness of your campaigns and
                            measure the incremental lift.{' '}
                            <a
                                href={'https://link.gorgias.com/01f'}
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                <strong>Learn more</strong>
                            </a>
                        </p>
                        <div className={css.testConfiguration}>
                            <div className={css.label}>
                                Active campaigns included:
                            </div>
                            <div className={css.value}>
                                Every active campaign within this chat will be
                                included in the A/B test.
                            </div>
                        </div>
                        <div className={css.testConfiguration}>
                            <div className={css.label}>Start date:</div>
                            <div className={css.value}>{formattedDate}</div>
                        </div>
                        <div className={css.info}>
                            Depending on the volume of your store traffic, the
                            test may take from 2 to 6 weeks to collect
                            sufficient data.
                        </div>
                    </div>
                    <div className={css.rightSide}>
                        <h3 className={css.headerRight}>How it works</h3>
                        <div className={css.content}>
                            <p>
                                Our A/B test setup involves splitting all
                                visitors who are expected to encounter at least
                                one campaign during their visit into two groups:
                            </p>
                            <ul className={css.noMargin}>
                                <li>
                                    <strong>
                                        Visitors in Group A will be exposed to
                                        all campaigns
                                    </strong>{' '}
                                    relevant to their session (50% of visitors).
                                </li>
                                <li>
                                    <strong>
                                        Visitors in Group B will not be exposed
                                        to the campaigns
                                    </strong>
                                    , even if they were expected to encounter
                                    multiple campaigns (50% of visitors).
                                </li>
                            </ul>
                            <p>
                                We can assess the impact of campaigns shown by
                                evaluating the difference of conversion rate,
                                average order value and total sales between
                                Group A and Group B.
                            </p>
                            <p>
                                You can expect an email from the Gorgias team
                                confirming the test launch within 5 business
                                days, along with a link to an external results
                                dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter className={css.footer}>
                <Button onClick={onClose} intent="secondary">
                    Cancel
                </Button>
                <Button
                    isLoading={isLoading}
                    onClick={submit}
                    data-testid="request-test-button"
                >
                    Start A test
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default RequestABTestModal
