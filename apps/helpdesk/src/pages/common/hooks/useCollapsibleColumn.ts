import { useAppContext } from 'pages/AppContext'

export const useCollapsibleColumn = () => {
    const {
        collapsibleColumnChildren,
        setCollapsibleColumnChildren,
        isCollapsibleColumnOpen,
        setIsCollapsibleColumnOpen,
        collapsibleColumnRef,
        warpToCollapsibleColumn,
    } = useAppContext()

    return {
        collapsibleColumnChildren,
        setCollapsibleColumnChildren,
        isCollapsibleColumnOpen,
        setIsCollapsibleColumnOpen,
        collapsibleColumnRef,
        warpToCollapsibleColumn,
    }
}
