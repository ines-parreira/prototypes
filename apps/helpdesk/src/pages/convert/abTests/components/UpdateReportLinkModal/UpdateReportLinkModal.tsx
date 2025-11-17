import type { FormEvent } from 'react'
import type React from 'react'
import { useState } from 'react'

import isUrl from 'validator/lib/isURL'

import { LegacyButton as Button } from '@gorgias/axiom'

import type { ABTest } from 'models/convert/abTest/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import InputField from 'pages/common/forms/input/InputField'

type Props = {
    abTest?: ABTest
    isOpen: boolean
    onSubmit: (data: any) => Promise<void>
    onClose: () => void
}

const UpdateReportLinkModal: React.FC<Props> = ({
    abTest,
    isOpen,
    onSubmit,
    onClose,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [reportLink, setReportLink] = useState<string>(
        abTest?.report_link ?? '',
    )
    const [error, setError] = useState<boolean>(false)

    const validateData = (value: string): boolean => {
        return isUrl(value)
    }

    const submit = async (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault()

        setError(false)
        if (!validateData(reportLink)) {
            setError(true)
            return
        }

        setIsLoading(true)

        try {
            await onSubmit({
                report_link: reportLink,
            })
        } catch {
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={close} size="large">
            <form onSubmit={submit}>
                <ModalBody>
                    <div>
                        <InputField
                            label="Report link"
                            name="report_link"
                            onChange={(value) => setReportLink(value)}
                            hasError={error}
                            value={reportLink}
                            error={error ? 'URL is not valid' : ''}
                        />
                    </div>
                </ModalBody>
                <ModalActionsFooter>
                    <Button onClick={onClose} intent="secondary">
                        Cancel
                    </Button>
                    <Button isLoading={isLoading} type="submit">
                        Save changes
                    </Button>
                </ModalActionsFooter>
            </form>
        </Modal>
    )
}

export default UpdateReportLinkModal
