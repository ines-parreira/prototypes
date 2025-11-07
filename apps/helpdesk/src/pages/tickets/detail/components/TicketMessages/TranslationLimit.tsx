import { useEffect, useRef, useState } from 'react'

import { Icon } from '@gorgias/axiom'

import css from './TranslationLimit.less'

export function TranslationLimit() {
    const [isVisible, setIsVisible] = useState(true)
    const mountTimeRef = useRef(Date.now())

    useEffect(() => {
        const elapsed = Date.now() - mountTimeRef.current
        const remaining = Math.max(0, 5000 - elapsed)

        const timer = setTimeout(() => {
            setIsVisible(false)
        }, remaining)

        return () => clearTimeout(timer)
    }, [])

    if (!isVisible) {
        return null
    }

    return (
        <div className={css.translationLimit}>
            <Icon name="info" size="sm" />
            <span className={css.translationLimitText}>
                Regeneration limit reached
            </span>
        </div>
    )
}
