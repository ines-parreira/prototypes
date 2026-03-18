import { useEffect, useRef, useState } from 'react'

import { Box, Icon, Text } from '@gorgias/axiom'

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
        <Box alignItems="center" gap="xxxs">
            <Icon name="info" size="sm" color="content-error-default" />
            <Text size="sm" color="content-error-default">
                Regeneration limit reached
            </Text>
        </Box>
    )
}
