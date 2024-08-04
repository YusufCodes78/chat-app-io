const generateMessage = (text, username)=>{
    return {
        username,
        text,
        createdAt: new Date().getTime(),
        type
    }
}
const generateLocationMessage = (url, username)=>{
    return {
        username,
        url,
        createdAt: new Date().getTime(),
        type
    }
}

export {generateMessage, generateLocationMessage}