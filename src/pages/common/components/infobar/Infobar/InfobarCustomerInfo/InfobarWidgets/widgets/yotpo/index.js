import Customer from './Customer.tsx'
import ReviewStatistics from './ReviewStatistics.tsx'
import Loyalty from './Loyalty.tsx'
import Reviews from './Reviews.tsx'

const yotpo = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

    if (path.match(/integrations\.[0-9]+\.customer$/)) {
        return Customer()
    }

    if (path.match(/integrations\.[0-9]+\.customer\.loyalty_statistics$/)) {
        return Loyalty()
    }

    if (path.match(/integrations\.[0-9]+\.customer\.reviews_statistics$/)) {
        return ReviewStatistics()
    }

    if (path.match(/integrations\.[0-9]+\.reviews\.\[]$/)) {
        return Reviews()
    }

    return {}
}

export default yotpo
