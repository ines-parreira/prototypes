import { useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import css from './MoreOptions.less'

export const MoreOptions = ({ shopName }: { shopName: string }) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const options = [
        {
            label: 'Edit',
            icon: 'edit',
            path: 'conversation-setup',
        },
        {
            label: 'Test campaign',
            icon: 'play_circle',
            path: 'activation',
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
                            to={`/app/ai-journey/${shopName}/${path}`}
                        >
                            <i className="material-icons-outlined">{icon}</i>
                            {label}
                        </Link>
                    ))}
                    <button
                        className={css.option}
                        onClick={() => {
                            setMenuOpen(false)
                            alert('Should pause journey')
                        }}
                    >
                        <i className="material-icons-outlined">pause</i>
                        Pause
                    </button>
                </motion.div>
            )}
        </div>
    )
}
