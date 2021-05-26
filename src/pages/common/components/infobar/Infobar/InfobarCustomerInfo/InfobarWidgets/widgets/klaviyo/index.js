import Customer from './Customer.tsx'
import Campaign from './Campaign.tsx'

const klaviyo = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

    if (path.match(/integrations\.[0-9]+\.customer$/)) {
        return Customer()
    }

    if (path.match(/integrations\.[0-9]+\.campaigns.\[]$/)) {
        return Campaign()
    }
}

export default klaviyo
