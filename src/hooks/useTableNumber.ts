import { useSearchParams } from 'react-router-dom';

export function useTableNumber() {
  const [searchParams] = useSearchParams();

  const table =
    searchParams.get('table') ||
    searchParams.get('tableNumber');

  return table
    ? Number(table)
    : null;
}