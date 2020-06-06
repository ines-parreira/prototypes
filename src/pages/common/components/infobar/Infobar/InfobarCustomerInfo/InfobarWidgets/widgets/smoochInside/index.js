import Root from './Root'

const smoochInside = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

    if (path.match(/integrations\.[0-9]+$/)) {
        return Root()
    }

    return {}
}

export default smoochInside
