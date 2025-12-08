import { UserRepository } from '@/lib/repositories/user.repository';
import { Database } from '@/types/database.types';
import bcrypt from 'bcryptjs';

type UserInsert = Database['public']['Tables']['user']['Insert'];

export class UserService {
  private userRepo = new UserRepository();

  /**
   * 註冊使用者
   */
  async register(userData: {
    email: string;
    username: string;
    password: string;
  }) {
    // 檢查 email 是否已存在
    try {
      await this.userRepo.findByEmail(userData.email);
      throw new Error('Email 已被使用');
    } catch (error: any) {
      if (error.message !== 'Email 已被使用') {
        // Email 不存在，可以繼續
      } else {
        throw error;
      }
    }

    // 檢查 username 是否已存在
    try {
      await this.userRepo.findByUsername(userData.username);
      throw new Error('使用者名稱已被使用');
    } catch (error: any) {
      if (error.message !== '使用者名稱已被使用') {
        // Username 不存在，可以繼續
      } else {
        throw error;
      }
    }

    // 雜湊密碼
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // 建立使用者
    const user: UserInsert = {
      email: userData.email,
      username: userData.username,
      password_hash: passwordHash,
      balance: 0,
      is_admin: false,
      is_blocked: false,
      violation_count: 0,
    };

    return this.userRepo.create(user);
  }

  /**
   * 登入（驗證密碼）
   */
  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new Error('使用者不存在');
    }

    if (user.is_blocked) {
      throw new Error('帳號已被封鎖');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new Error('密碼錯誤');
    }

    // 移除密碼雜湊
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * 查詢使用者
   */
  async getUserById(id: number) {
    const user = await this.userRepo.findById(id);
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * 查詢使用者列表
   */
  async getUsers(page: number = 1, limit: number = 20, isAdmin?: boolean) {
    return this.userRepo.findMany({ page, limit, isAdmin });
  }

  /**
   * 更新使用者
   */
  async updateUser(id: number, userData: Partial<UserInsert>) {
    // 如果有密碼，需要雜湊
    if (userData.password_hash) {
      // 這裡假設傳入的是明文密碼，需要雜湊
      // 實際使用時應該在前端或 API 層處理
    }
    return this.userRepo.update(id, userData);
  }

  /**
   * 儲值
   */
  async topUp(userId: number, amount: number) {
    if (amount <= 0) {
      throw new Error('儲值金額必須大於 0');
    }

    // 更新餘額
    await this.userRepo.updateBalance(userId, amount);

    // 記錄交易（這裡應該使用 transaction_record repository）
    // 為了簡化，這裡先省略

    return this.userRepo.findById(userId);
  }

  /**
   * 取得使用者統計
   */
  async getUserStatistics(userId: number) {
    return this.userRepo.getStatistics(userId);
  }
}

