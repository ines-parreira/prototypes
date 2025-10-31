import { useEffect } from 'react'

import { useLocation } from 'react-router-dom'

export function useScrollToHash() {
    const location = useLocation()
    useEffect(() => {
        const hash = location.hash
        if (!hash) return

        const element = document.getElementById(hash.slice(1))
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }, [location.hash])
}
