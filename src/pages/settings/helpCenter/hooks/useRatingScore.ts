import {useMemo} from 'react'
import {Rating} from 'models/helpCenter/types'

export function calculateRatingScore(rating: Rating | undefined) {
    const up = rating?.up || 0
    const down = rating?.down || 0
    const sum = up + down
    return sum ? Math.ceil(((up - down) / sum) * 100) : 0
}

export function useRatingScore(rating: Rating | undefined) {
    return useMemo(() => calculateRatingScore(rating), [rating])
}
