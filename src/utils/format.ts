export const getUniqueValue = (data: string[], newData?: string | null) => {
  return newData && data.indexOf(newData) === -1 ? [...data, newData] : data
}
