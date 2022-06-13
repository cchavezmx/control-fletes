const getDate = (date) => {
  if(dateRequest !== currentModel.request_date) {
    return dayjs(date).format('YYYY-MM-DD')
  } else {
    return dayjs(date).add(1, 'day').format('YYYY-MM-DD')
  }
}

export default getDate
