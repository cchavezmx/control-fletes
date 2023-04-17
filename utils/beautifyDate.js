const beautifyDate = (date) => {
  const d = new Date(date)
  return Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: 'numeric'
  }).format(d)
}

export {
  beautifyDate
}
