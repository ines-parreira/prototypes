import { ReactNode } from 'react'

import classNames from 'classnames'

import useId from 'hooks/useId'
import { Drawer } from 'pages/common/components/Drawer'

import css from './NodeEditorDrawer.less'

type Props = {
    label?: string
    onClose: () => void
    children?: ReactNode
    isPreview?: boolean
    headerSaperator?: boolean
    testId: string
    className?: string
}

const EditorDrawerHeader = ({
    onClose,
    children,
    label,
    isPreview,
    headerSaperator,
    className,
}: Props) => {
    const closeButtonId = `${
        isPreview ? 'preview-' : ''
    }close-button-${useId()}`

    return (
        <Drawer.Header
            className={classNames(css.header, className, {
                [css.headerSaperator]: headerSaperator,
            })}
        >
            <div className={css.headerTop}>
                {label && <h3 title={label}>{label}</h3>}
                <Drawer.HeaderActions
                    onClose={onClose}
                    closeButtonId={closeButtonId}
                >
                    {children}
                </Drawer.HeaderActions>
            </div>
        </Drawer.Header>
    )
}

export default EditorDrawerHeader
