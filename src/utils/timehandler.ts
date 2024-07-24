export const getDate = (timestamp: number) => {
    // YYYY-MM-DD HH:MM，时间补零
    const date = new Date(timestamp * 1000)
    
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')

    return `${year}-${month}-${day} ${hour}:${minute}`
}