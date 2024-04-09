import React, {useState} from 'react'
import {Link} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import {ABTest} from 'models/convert/abTest/types'

import css from './ViewABTestModal.less'

type Props = {
    abTests?: ABTest[]
    isOpen: boolean
    onClose: () => void
    onSubmit: () => void
}

const ViewABTestModal = ({isOpen, abTests, onClose, onSubmit}: Props) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const submit = () => {
        setIsLoading(true)

        onSubmit()

        setIsLoading(false)
    }
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="large">
            <ModalHeader
                title="You have an ongoing A/B test"
                subtitle={
                    <span>
                        Campaigns are hidden for 50% of your visitors.{' '}
                        <Link to={''}>
                            <strong>Learn more</strong>
                        </Link>
                    </span>
                }
            />
            <ModalBody>
                <div className={css.links}>
                    {abTests &&
                        abTests.length > 0 &&
                        abTests.map((abTestDetails, idx) => {
                            return (
                                <div key={idx}>
                                    {abTestDetails.report_link ? (
                                        <a
                                            href={abTestDetails.report_link}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                        >
                                            Link to your Results Dashboard
                                        </a>
                                    ) : (
                                        <span>Link will be visible soon</span>
                                    )}
                                </div>
                            )
                        })}
                </div>
            </ModalBody>
            <ModalActionsFooter>
                <Button
                    isLoading={isLoading}
                    onClick={submit}
                    intent="secondary"
                    data-testid="stop-test-button"
                >
                    Stop Test
                </Button>
                <Button onClick={onClose}>Ok</Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default ViewABTestModal
