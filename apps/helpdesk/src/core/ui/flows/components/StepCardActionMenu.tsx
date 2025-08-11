import { useRef } from 'react'

import { IconButton } from '@gorgias/merchant-ui-kit'

import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'

import css from './StepCardActionMenu.less'

export type StepCardActionMenuProps = {
    children?: React.ReactNode
}

export function StepCardActionMenu({ children }: StepCardActionMenuProps) {
    const dropdownButtonRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <div ref={dropdownButtonRef} className={css.menuButton}>
                <IconButton
                    size="small"
                    fillStyle="ghost"
                    intent="secondary"
                    title="Action menu"
                    icon="more_vert"
                />
            </div>
            <UncontrolledDropdown
                target={dropdownButtonRef}
                placement="bottom-end"
            >
                {children}
            </UncontrolledDropdown>
        </>
    )
}
