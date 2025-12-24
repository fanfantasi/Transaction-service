import { Request, Response } from "express";
import responseData from "../services/response";
import { getClient } from '../services/db';
import {
    generateTokens
} from '../services/token.util';
import { authController } from "../controller/auth.controller";
import { LowerCaseValidator, MaxLengthValidator, MinLengthValidator, PasswordValidatorManager, SpecialCharacterValidator, UpperCaseValidator } from '@password-validator/core';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

export const userController = {
    async register(req: Request, res: Response) {
        const client = await getClient();
        try {
            const status = await client.query(
                'SELECT 1 FROM users WHERE email = $1 LIMIT 1',
                [req.body?.email]
            );

            if (status.rows.length > 0) {
                return responseData.resBadRequest(res, `Email already in use.`);
            }

            const pm = PasswordValidatorManager.standard();
            pm.register(
                new MinLengthValidator(8),
                new MaxLengthValidator(16),
                new UpperCaseValidator(1),
                new LowerCaseValidator(1),
                new SpecialCharacterValidator(1)
            );

            const ps: any = pm.validate(req.body?.password);
            if (!ps.valid) {
                return responseData.resBadRequest(res, ps.messages);
            }
            await client.query('BEGIN');

            const userResult = await client.query(
                `
                INSERT INTO users (email, password)
                VALUES ($1, $2)
                RETURNING id, email
                `,
                [
                    req.body.email,
                    bcrypt.hashSync(req.body.password, 10),
                ]
            );
            

            const userId = userResult.rows[0].id;

            await client.query(
                `
                INSERT INTO wallets (user_id, balance)
                VALUES ($1, 0)
                `,
                [userId]
            );

            const jti = uuidv4();
            const { accessToken, refreshToken } = generateTokens(
                userResult.rows[0],
                jti
            );

            await authController.addrefreshtokenToWhitelist(
                jti,
                refreshToken,
                userId
            );

            await client.query('COMMIT');
            return res.status(200).json({
                error: null,
                message: `Register user Successfully`,
                data: {
                    accessToken,
                    refreshToken,
                },
            });

        } catch (err) {
            await client.query('ROLLBACK');
            console.log(err)
            return responseData.resBadRequest(res, `Register user Unsuccessfully.`);
        } finally {
            client.release();
        }
    },

    async login(req: Request, res: Response) {
        const client = await getClient();
        try {
            const find = await client.query(
                'SELECT * FROM users WHERE email = $1 LIMIT 1',
                [req.body?.email]
            );

            if (find.rows.length > 0) {
                const result = find.rows[0];
                var hash = result.password;
                const isValid = await bcrypt.compare(req.body?.password, hash);
                if (!isValid) {
                    return responseData.resBadRequest(res, 'Password is incorrect.');
                }
                const jti = uuidv4();
                const { accessToken, refreshToken } = generateTokens(result, jti)
                await authController.addrefreshtokenToWhitelist(jti, refreshToken, result.id)
                var resData = {
                    'email': result.email,
                    'token': accessToken,
                    'refresh': refreshToken,
                }
                return res.status(200).json({
                    error: null,
                    message: `Login Successfully`,
                    data: resData
                })
            } else {
                return responseData.resBadRequest(res, `Email not found.`)
            }
        } catch (err) {
            console.log(err)
            return responseData.resBadRequest(res, `Login user unsuccessfully.`)
        } finally {
            client.release();
        }
    },

    async getCurrentUser(req: Request, res: Response) {
        const client = await getClient();
        try {
            const find = await client.query(
                'SELECT email,created_at FROM users WHERE id = $1 LIMIT 1',
                [req.body?.payload.userId]
            );
            if (find.rows.length > 0) {
                const result = find.rows[0];
                return res.status(200).json({
                    error: null,
                    message: `Get Current User Successfully`,
                    data: result
                })
            } else {
                return responseData.resBadRequest(res, `User not found.`)
            }
        } catch (err) {
            console.log(err)
            return responseData.resUnauthorization(res, `Please Try again.`)
        } finally {
            client.release();
        }
    }
}

export default userController