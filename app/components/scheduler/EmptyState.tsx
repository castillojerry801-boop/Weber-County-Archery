type Props = { message: string };

export function EmptyState({ message }: Props) {
  return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-sm">{message}</p>
    </div>
  );
}
