import { useAppContext } from 'pages/AppContext'

export const useCollapsibleColumn = () => {
    const {
        collapsibleColumnChildren,
        setCollapsibleColumnChildren,
        isCollapsibleColumnOpen,
        setIsCollapsibleColumnOpen,
        collapsibleColumnWidthConfig,
        setCollapsibleColumnWidthConfig,
        collapsibleColumnRef,
        warpToCollapsibleColumn,
    } = useAppContext()

    return {
        collapsibleColumnChildren,
        setCollapsibleColumnChildren,
        isCollapsibleColumnOpen,
        setIsCollapsibleColumnOpen,
        collapsibleColumnWidthConfig,
        setCollapsibleColumnWidthConfig,
        collapsibleColumnRef,
        warpToCollapsibleColumn,
    }
}
