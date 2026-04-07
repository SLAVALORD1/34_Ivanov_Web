interface Props {
  message: string;
}

export const ErrorMessage = ({ message }: Props) => (
  <div className="error">Ошибка: {message}</div>
);