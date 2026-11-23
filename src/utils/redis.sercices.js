
export const userPrefixKey = (userId)=>   `users:${userId}:otp`

export const confirmEmailKey = (userId)=>   `${userPrefixKey(userId)}:otp:confirmEmail`
export const ResendOtpKey = (userId)=>   `${userPrefixKey(userId)}:otp:resend`
export const attempsKey = (userId)=>   `${userPrefixKey(userId)}:attemps`
export const attempBlocksKey = (userId)=>   `${userPrefixKey(userId)}:Block`
export const attempBlocksCountKey = (userId)=>   `${userPrefixKey(userId)}:BlockCount`


export const usersessionjwtidprefixkey = (userId)=>{
    return `users:${userId} session`
}

export const usersessionjwtid = (userId , jwtid)=>{
    return `${usersessionjwtidprefixkey(userId)}:${jwtid} `
}