export function throwError(res, statusCode, message){
    res.status(statusCode).json({ error: message });
}