import { useCallback, useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { JourneyStatusEnum } from '@gorgias/convert-client'

import css from './MoreOptions.less'

export const MoreOptions = ({
    shopName,
    journeyState,
    journeyType,
    handleChangeStatus,
}: {
    shopName: string
    journeyState: JourneyStatusEnum
    journeyType: string
    handleChangeStatus: () => void
}) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const formattedJourneyType = journeyType.replace('_', '-')

    const options = [
        {
            label: 'Edit',
            icon: 'edit',
            path: 'setup',
        },
        {
            label: 'Test',
            icon: 'list',
            path: 'test',
        },
        {
            label: 'Activation',
            icon: 'play_circle',
            path: 'activate',
        },
    ]

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false)
            }
        }
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [menuOpen])

    const handleChangeStatusOnClick = useCallback(async () => {
        await handleChangeStatus()
        setMenuOpen(false)
    }, [handleChangeStatus])

    const statusContent: Record<
        JourneyStatusEnum,
        { icon: string; label: string }
    > = {
        [JourneyStatusEnum.Active]: {
            icon: 'pause',
            label: 'Pause Journey',
        },
        [JourneyStatusEnum.Paused]: {
            icon: 'play_arrow',
            label: 'Activate Journey',
        },
        // fallback for draft state to activate if neceessary (it shouldn't happen)
        [JourneyStatusEnum.Draft]: {
            icon: 'play_arrow',
            label: 'Activate Journey',
        },
    }

    return (
        <div
            className={css.statusRight}
            style={{ position: 'relative' }}
            ref={menuRef}
        >
            <div
                className={css.menuButton}
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Open options"
            >
                <i className="material-icons-outlined">more_horiz</i>
            </div>
            {menuOpen && (
                <motion.div
                    className={css.menuPopover}
                    initial={{ height: 0, opacity: 0, transformOrigin: 'top' }}
                    animate={{ height: 'max-content', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                >
                    {options.map(({ label, icon, path }, index) => (
                        <Link
                            className={css.option}
                            key={index}
                            to={`/app/ai-journey/${shopName}/${formattedJourneyType}/${path}`}
                        >
                            <i className="material-icons-outlined">{icon}</i>
                            {label}
                        </Link>
                    ))}
                    <button
                        className={css.option}
                        onClick={handleChangeStatusOnClick}
                    >
                        <i className="material-icons-outlined">
                            {statusContent[journeyState].icon}
                        </i>
                        {statusContent[journeyState].label}
                    </button>
                </motion.div>
            )}
        </div>
    )
}
