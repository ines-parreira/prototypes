import React, {useState} from 'react'
import RequestABTestModal from 'pages/stats/convert/components/RequestABTestModal'
import ViewABTestModal from 'pages/stats/convert/components/ViewABTestModal'
import Button from 'pages/common/components/button/Button'

const RequestABTest = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    // Dummy placeholder
    const [hasOngoingTest, setHasOngoingTest] = useState<boolean>(false)

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const startTestSubmit = () => {
        setHasOngoingTest(true)
        closeModal()
    }

    const stopTestSubmit = () => {
        setHasOngoingTest(false)
        closeModal()
    }

    return (
        <>
            <Button onClick={openModal} intent="secondary">
                {hasOngoingTest ? 'View ongoing A/B test' : 'Request A/B Test'}
            </Button>
            <ViewABTestModal
                isOpen={hasOngoingTest && isModalOpen}
                onClose={closeModal}
                onSubmit={stopTestSubmit}
            />
            <RequestABTestModal
                isOpen={!hasOngoingTest && isModalOpen}
                onClose={closeModal}
                onSubmit={startTestSubmit}
            />
        </>
    )
}

export default RequestABTest
