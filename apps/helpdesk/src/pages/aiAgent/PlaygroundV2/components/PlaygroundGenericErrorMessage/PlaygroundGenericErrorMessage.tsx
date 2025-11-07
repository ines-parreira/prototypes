import css from './PlaygroundGenericErrorMessage.less'

export const PlaygroundGenericErrorMessage = ({
    onClick,
}: {
    onClick: () => void
}) => (
    <div>
        AI Agent encountered an error and didn’t send a response.
        <div
            className={css.errorMessageLink}
            // oxlint-disable-next-line prefer-tag-over-role
            role="button"
            tabIndex={0}
            onClick={onClick}
        >
            Try again.
        </div>
    </div>
)
