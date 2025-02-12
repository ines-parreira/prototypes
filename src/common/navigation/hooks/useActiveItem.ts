import {useMemo} from 'react'
import {useLocation} from 'react-router-dom'

const pathItemMap: Record<string, string> = {
    '/app/automation': 'automate',
    '/app/ai-agent': 'ai-agent',
    '/app/convert': 'convert',
    '/app/customer': 'customers',
    '/app/customers': 'customers',
    '/app/home': 'home',
    '/app/settings': 'settings',
    '/app/stats': 'statistics',
    '/app/ticket': 'tickets',
    '/app/tickets': 'tickets',
    '/app/views': 'tickets',
}

export default function useActiveItem() {
    const {pathname: path} = useLocation()

    return useMemo(() => {
        const m = path.match(/^\/app\/[^\/]+/)
        if (!m) return 'tickets'

        return pathItemMap[m[0]] || 'tickets'
    }, [path])
}
