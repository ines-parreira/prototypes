import React, {
    forwardRef,
    useState,
    useCallback,
    useImperativeHandle,
} from 'react'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ImageField from './ImageField'

import css from './UploadLogoModal.less'

export type UploadLogoModalHandle = {
    open: () => void
}

type UploadLogoModalHandleProps = {
    onConfirm: (url: string) => void
    uploadMaxSize: number
}

const UploadLogoModal = forwardRef<
    UploadLogoModalHandle,
    UploadLogoModalHandleProps
>(({onConfirm, uploadMaxSize}, ref) => {
    const [url, setUrl] = useState<string>()
    const [isOpen, setIsOpen] = useState(false)

    const onClose = useCallback(() => setIsOpen(false), [])
    const onSave = useCallback(() => {
        onClose()
        onConfirm(url!)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onConfirm, url])

    useImperativeHandle(
        ref,
        () => ({
            open: () => {
                setIsOpen(true)
            },
        }),
        []
    )

    return (
        <Modal onClose={() => setIsOpen(false)} isOpen={isOpen} size="small">
            <ModalHeader title="Upload logo" />
            <ModalBody className={css.body}>
                <ImageField
                    onChange={setUrl}
                    isDiscardable={false}
                    url={url}
                    shouldSeparateImageInfo={false}
                    maxSize={uploadMaxSize}
                />
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={onSave} isDisabled={!url}>
                    Save
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
})

export default UploadLogoModal
