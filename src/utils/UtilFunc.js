export const formatDate = (date = new Date()) => {
    const dateArr = date.toLocaleString().split(" ");  // [Sat, Nov, 30, 16:45:44, 2019] 
    const yyyy = dateArr[4]
    const MMM = dateArr[1]
    const dd = dateArr[2]
    const hhmmss = dateArr[3].split(":")
    const hhmm = hhmmss[0] + ':' + hhmmss[1]
    const ampm = Number.parseInt(hhmmss[0]) >= 12? 'PM' : 'AM'

    const dateTimeStr = dd + ' ' + MMM + ' ' + yyyy + ' ' + hhmm + ' ' + ampm
    return(dateTimeStr)
}

export const unFormatDate = (dateStr) => {
  // dateStr => 2019-11-15 18:57:30

  date = new Date(dateStr)
  return date
}