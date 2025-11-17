import type { ReactNode } from 'react'
import type React from 'react'

import ModalBody from 'pages/common/components/modal/ModalBody'

import css from './MigrationBaseModalBody.less'

type Props = {
    children: ReactNode
}

const MigrationBaseModal: React.FC<Props> = ({ children }) => {
    return <ModalBody className={css.wrapper}>{children}</ModalBody>
}

export default MigrationBaseModal
