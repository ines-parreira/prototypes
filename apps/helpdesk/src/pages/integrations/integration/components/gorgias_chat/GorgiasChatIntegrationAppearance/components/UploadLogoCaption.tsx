import type React from 'react'
import { useRef } from 'react'

import type { UploadLogoModalHandle } from './UploadLogoModal'
import UploadLogoModal from './UploadLogoModal'

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
