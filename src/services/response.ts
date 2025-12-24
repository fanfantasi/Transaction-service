import { Response } from "express";

export const responseData = {
    resBadRequest(res: Response, message:any){
        return res.status(400).json({
            error   : 'Bad Request',
            message : message,
        })
    },

    resUnauthorization(res: Response, message:any){
        return res.status(401).json({
            error   : 'Unauthorized',
            message : message,
        })
    },
    
    resForBidden(res: Response, message:any){
        return res.status(403).json({
            error   : 'Forbidden',
            message : message,
        })
    }
}

export default responseData;