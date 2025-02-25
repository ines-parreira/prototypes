import React, { useState } from 'react'

import { ABTest } from 'models/convert/abTest/types'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './ViewABTestModal.less'

type Props = {
    abTests?: ABTest[]
    isOpen: boolean
    onClose: () => void
    onSubmit: () => void
}

const ViewABTestModal = ({ isOpen, abTests, onClose, onSubmit }: Props) => {
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
                        <a
                            href={'https://link.gorgias.com/01f'}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <strong>Learn more</strong>
                        </a>
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
