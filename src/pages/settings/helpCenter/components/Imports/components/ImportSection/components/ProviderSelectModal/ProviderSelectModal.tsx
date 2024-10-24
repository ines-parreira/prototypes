import React from 'react'

import {MigrationProvider} from '../../types'

import MigrationBaseModal from '../MigrationBaseModal'
import ProviderInfo from '../ProviderInfo'

import css from './ProviderSelectModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void

    providers: MigrationProvider[]
    onProviderSelect: (type: string) => void
}

const ProviderSelectModal: React.FC<Props> = ({
    isOpen,
    onClose,
    providers,
    onProviderSelect,
}) => {
    // To revert the removal of searching revert this commit: 67c927305fb16f6adb8fb806ade650aad0b2ea97

    const handleClose = () => {
        onClose()
    }

    const handleProviderSelect = (type: string) => {
        onProviderSelect(type)
        handleClose()
    }

    return (
        <>
            <MigrationBaseModal
                isOpen={isOpen}
                onClose={handleClose}
                title="Select your current product"
            >
                <div className="mb-4"></div>
                {providers.map((provider, idx) => (
                    <ProviderInfo
                        className={css.provider}
                        key={idx}
                        onClick={() => handleProviderSelect(provider.type)}
                        provider={provider}
                    />
                ))}
            </MigrationBaseModal>
        </>
    )
}

export default ProviderSelectModal
