const isDevelopment = process.env.NODE_ENV === 'development';

export function safeLog(message: string, data?: any) {
    if (isDevelopment) {
        console.log(message, data);
    }
}