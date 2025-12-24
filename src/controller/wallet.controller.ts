import { Request, Response } from "express";
import responseData from "../services/response";
import { getClient } from '../services/db';

export const walletController = {
    async getWalletByUserId(req: Request, res: Response) {
        const client = await getClient();
        try {
            const result = await client.query(
                `SELECT
                u.id AS user_id,
                u.email,
                COALESCE(w.id, NULL)  AS wallet_id,
                COALESCE(w.balance, 0) AS balance,
                u.created_at
                FROM users u
                LEFT JOIN wallets w
                ON w.user_id = u.id
                WHERE u.id = $1
                LIMIT 1`,
                [req.body.payload.userId]
            );

            if (result.rows.length > 0) {
                return res.status(200).json({
                    error: null,
                    message: `Get wallet Successfully`,
                    data: result.rows[0]
                })
            } else {
                return responseData.resBadRequest(res, `Wallet not found.`);
            }
        } catch (err) {
            console.log(err)
            return responseData.resBadRequest(res, `Get wallet unsuccessfully.`);
        } finally {
            client.release();
        }
    },

    async depositWallet(req: Request, res: Response) {
        const { amount, referenceId } = req.body;
        const userId = req.body?.payload.userId;

        const client = await getClient();
        if (typeof amount !== 'number' || isNaN(amount)) {
            return responseData.resBadRequest(res, 'Invalid amount type');
        }
        if (amount <= 0) {
            return responseData.resBadRequest(res, 'Amount must be greater than 0');
        }

        if (!referenceId || typeof referenceId !== 'string') {
            return responseData.resBadRequest(res, 'Invalid referenceId');
        }

        const MAX_REF_LENGTH = 64;
        if (referenceId.length > MAX_REF_LENGTH) {
            return responseData.resBadRequest(
                res,
                `referenceId too long (max ${MAX_REF_LENGTH} characters)`
            );
        }
        try {
            await client.query('BEGIN');

            const { rows } = await client.query(
                `
                SELECT id, balance
                FROM wallets
                WHERE user_id = $1
                FOR UPDATE
                `,
                [userId]
            );

            if (rows.length === 0) {
                return responseData.resBadRequest(res, 'Wallet not found');
            }

            const walletId = rows[0].id;

            const result = await client.query<{ balance: number }>(
                `
                UPDATE wallets
                SET balance = balance + $1, updated_at = NOW()
                WHERE id = $2
                RETURNING balance
                `,
                [amount, walletId]
            );

            const newBalance = result.rows[0].balance;

            await client.query(
                `
                INSERT INTO ledger_entries
                (wallet_id, amount, type, reference_id, balance_after)
                VALUES ($1, $2, 'DEPOSIT', $3, $4)
                `,
                [walletId, amount, referenceId, newBalance]
            );

            await client.query('COMMIT');

            return res.json({
                message: 'Deposit success',
                balance: newBalance,
            });
        } catch (err: any) {
            await client.query('ROLLBACK');

            if (err.code === '23505') {
                return responseData.resBadRequest(
                    res,
                    'Duplicate referenceId (deposit already processed)'
                );
            }

            throw err;
        } finally {
            client.release();
        }
    },

    async spendWallet(req: Request, res: Response) {
        const { amount, referenceId } = req.body;
        const client = await getClient();
        if (typeof amount !== 'number' || isNaN(amount)) {
            return responseData.resBadRequest(res, 'Invalid amount type');
        }
        if (amount <= 0) {
            return responseData.resBadRequest(res, 'Amount must be greater than 0');
        }


        if (!referenceId || typeof referenceId !== 'string') {
            return responseData.resBadRequest(res, 'Invalid referenceId');
        }
        
        const MAX_REF_LENGTH = 64;
        if (referenceId.length > MAX_REF_LENGTH) {
            return responseData.resBadRequest(
                res,
                `referenceId too long (max ${MAX_REF_LENGTH} characters)`
            );
        }
        try {
            await client.query('BEGIN');

            const { rows: userRows } = await client.query<{ wallet_id: string }>(
                'SELECT wallet_id FROM users WHERE id = $1',
                [req.body.payload.userId]
            );

            if (userRows.length === 0) {
                return res.status(404).json({ message: 'User tidak ditemukan' });
            }
            const walletId = userRows[0].wallet_id;

            const { rows } = await client.query<{ balance: number }>(
                'SELECT balance FROM wallets WHERE id = $1 FOR UPDATE',
                [walletId]
            );
            
            if (rows.length === 0) {
                return responseData.resBadRequest(res, `Wallet not found`);
            }
            if (rows[0].balance < amount) {
                return responseData.resBadRequest(res, `Insufficient balance`);
            }

            const result = await client.query<{ balance: number }>(
                `UPDATE wallets
                SET balance = balance - $1, updated_at = NOW()
                WHERE id = $2
                RETURNING balance`,
                [amount, walletId]
            );

            const newBalance = result.rows[0].balance;
            await client.query(
                `INSERT INTO ledger_entries
                (wallet_id, amount, type, reference_id, balance_after)
                VALUES ($1, $2, 'SPEND', $3, $4)`,
                [walletId, -amount, referenceId, newBalance]
            );

            await client.query('COMMIT');
            return res.status(200).json({
                error: null,
                message: `Deposit wallet Successfully`,
                balance: newBalance
            })
        } catch (err: any) {
            await client.query('ROLLBACK');
            return responseData.resBadRequest(res, `Spend wallet unsuccessfully.`);
        } finally {
            client.release();
        }
    },

    async withdrawWallet(req: Request, res: Response) {
        const { amount, referenceId } = req.body;
        const client = await getClient();
        if (typeof amount !== 'number' || isNaN(amount)) {
            return responseData.resBadRequest(res, 'Invalid amount type');
        }
        if (amount <= 0) {
            return responseData.resBadRequest(res, 'Amount must be greater than 0');
        }

        if (!referenceId || typeof referenceId !== 'string') {
            return responseData.resBadRequest(res, 'Invalid referenceId');
        }
        
        const MAX_REF_LENGTH = 64;
        if (referenceId.length > MAX_REF_LENGTH) {
            return responseData.resBadRequest(
                res,
                `referenceId too long (max ${MAX_REF_LENGTH} characters)`
            );
        }
        try {

            await client.query('BEGIN');

            const { rows: userRows } = await client.query<{ wallet_id: string }>(
                'SELECT wallet_id FROM users WHERE id = $1',
                [req.body.payload.userId]
            );

            if (userRows.length === 0) {
                return res.status(404).json({ message: 'User tidak ditemukan' });
            }
            const walletId = userRows[0].wallet_id;
            
            const { rows } = await client.query<{ balance: number }>(
                'SELECT balance FROM wallets WHERE id = $1 FOR UPDATE',
                [walletId]
            );

            if (rows.length === 0) {
                return responseData.resBadRequest(res, `Wallet not found`);
            }
            if (rows[0].balance < amount) {
                return responseData.resBadRequest(res, `Insufficient balance`);
            }

            const result = await client.query<{ balance: number }>(
                `UPDATE wallets
                SET balance = balance - $1, updated_at = NOW()
                WHERE id = $2
                RETURNING balance`,
                [amount, walletId]
            );

            const newBalance = result.rows[0].balance;

            await client.query(
                `INSERT INTO ledger_entries
                (wallet_id, amount, type, reference_id, balance_after)
                VALUES ($1, $2, 'WITHDRAW', $3, $4)`,
                [walletId, -amount, referenceId, newBalance]
            );

            //Proccess external withdrawal (Paymentgateways, Banks, dan lain sebagainnya)
            /////////////////////////////////////////////////
            /////////////////////////////////////////////////


            await client.query('COMMIT');
            return res.status(200).json({
                error: null,
                message: `Withdraw Successfully`,
                balance: newBalance
            })
        } catch (err: any) {
            await client.query('ROLLBACK');
            return responseData.resBadRequest(res, `Duplicate referenceId (withdraw already processed)`);
        } finally {
            client.release();
        }
    }
}
export default walletController