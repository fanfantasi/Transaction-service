import { query } from '../services/db';
import { hashToken } from '../services/hashToken';

export const authController = {
    async addrefreshtokenToWhitelist(jti:any, refreshtoken:any, userId:any) {
      console.log(userId)
        return query(
            'INSERT INTO refresh_tokens (jti, token_hash, user_id) VALUES ($1, $2, $3)',
            [jti, hashToken(refreshtoken), userId]
        );
    },

    async findUserById(id:any){
        const result = await query(
          'SELECT * FROM users WHERE id = $1',
          [id]
        );

        return result.rows[0] || null;   
    }
}
export default authController;