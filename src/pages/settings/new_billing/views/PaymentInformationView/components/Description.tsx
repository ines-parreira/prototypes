import css from './Description.less'

export const Description: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => <div className={css.description}>{children}</div>
