import Root from './Root.tsx'

const http = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

    if (path.match(/integrations\.[0-9]+$/)) {
        return Root()
    }

    return {}
}

export default http
