import css from './KnowledgeEditorSidePanelTwoColumnsContent.less'

type RowConfig = {
    left: React.ReactNode
    right: React.ReactNode
    // If true, both left and right elements will take the full width of the component (and be shown in two lines)
    fullWidth?: boolean
}

type Props = {
    columns: RowConfig[]
}

export const KnowledgeEditorSidePanelTwoColumnsContent = ({
    columns,
}: Props) => {
    return (
        <table>
            <tbody className={css.table}>
                {columns.map(({ left, right, fullWidth }, index) => (
                    <tr
                        key={index}
                        className={fullWidth ? css.rowFullWidth : css.row}
                    >
                        <th scope="row" className={css.left}>
                            {left}
                        </th>
                        <td className={css.right}>{right}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
