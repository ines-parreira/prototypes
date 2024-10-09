import {InterpretAs} from 'pages/stats/TrendBadge/TrendBadge'

export function getTrendColorFromSign(
    sign: number,
    interpretAs: InterpretAs
): string {
    let trendColor = sign > 0 || sign < 0 ? 'neutral' : 'unchanged'
    if (interpretAs === 'more-is-better') {
        trendColor = sign > 0 ? 'positive' : sign < 0 ? 'negative' : 'unchanged'
    } else if (interpretAs === 'less-is-better') {
        trendColor = sign > 0 ? 'negative' : sign < 0 ? 'positive' : 'unchanged'
    }
    return trendColor
}
