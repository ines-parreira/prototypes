import {History, Location} from 'history'
import {Metric, onINP} from 'web-vitals'

/**
 * Measures Interaction to Next Paint (INP) Web Vital.
 * More info: https://web.dev/inp/
 */
export function measureInp(
    history: History,
    handler: (inp: Metric, location: Location) => void
) {
    let prevLocation = history.location
    let inp: Metric | undefined

    const unregisterListener = history.listen((location) => {
        if (inp) {
            handler(inp, prevLocation)
            inp = undefined
        }
        prevLocation = location
    })

    onINP(
        (metric) => {
            inp = metric
        },
        {
            reportAllChanges: true,
        }
    )

    return unregisterListener
}
