import css from './KnowledgeEditorSidePanelTwoColumnsContent.less'

type Props = {
    columns: [React.ReactNode, React.ReactNode][]
}

export const KnowledgeEditorSidePanelTwoColumnsContent = ({
    columns,
}: Props) => {
    return (
        <table>
            <tbody className={css.table}>
                {columns.map(([left, right], index) => (
                    <tr key={index} className={css.row}>
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
