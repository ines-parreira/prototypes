import { useAppContext } from 'pages/AppContext'

export const useCollapsibleColumn = () => {
    const {
        collapsibleColumnChildren,
        setCollapsibleColumnChildren,
        isCollapsibleColumnOpen,
        setIsCollapsibleColumnOpen,
    } = useAppContext()

    return {
        collapsibleColumnChildren,
        setCollapsibleColumnChildren,
        isCollapsibleColumnOpen,
        setIsCollapsibleColumnOpen,
    }
}
