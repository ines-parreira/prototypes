import React, { useRef } from 'react'

import UploadLogoModal, { UploadLogoModalHandle } from './UploadLogoModal'

type UploadLogoCaptionProps = {
    onConfirm: (url: string) => void
}

const UploadLogoCaption: React.FC<UploadLogoCaptionProps> = ({ onConfirm }) => {
    const modal = useRef<UploadLogoModalHandle>(null)

    return (
        <>
            <a
                href="#"
                onClick={(ev) => {
                    ev.preventDefault()
                    modal.current?.open()
                }}
            >
                Upload a logo
            </a>{' '}
            to enable this option
            <UploadLogoModal
                ref={modal}
                onConfirm={onConfirm}
                uploadMaxSize={500 * 1000}
            />
        </>
    )
}

export default UploadLogoCaption
