import { ClassRepository } from '@/lib/repositories/class.repository';

export class ClassService {
  private classRepo = new ClassRepository();

  /**
   * 取得所有分類
   */
  async getAllClasses() {
    return this.classRepo.findAll();
  }

  /**
   * 根據 ID 取得單一分類
   */
  async getClassById(id: number) {
    return this.classRepo.findById(id);
  }

  /**
   * 新增分類
   */
  async createClass(classData: { class_name: string; description?: string }) {
    // 驗證分類名稱
    if (!classData.class_name || classData.class_name.trim().length === 0) {
      throw new Error('分類名稱不能為空');
    }

    if (classData.class_name.trim().length > 50) {
      throw new Error('分類名稱不能超過 50 個字元');
    }

    // 檢查分類名稱是否已存在
    try {
      const existing = await this.classRepo.findAll();
      const duplicate = existing.find(
        (c) => c.class_name.toLowerCase() === classData.class_name.trim().toLowerCase()
      );
      if (duplicate) {
        throw new Error('分類名稱已存在');
      }
    } catch (error: any) {
      if (error.message === '分類名稱已存在') {
        throw error;
      }
      // 其他錯誤忽略，繼續執行
    }

    return this.classRepo.create({
      class_name: classData.class_name.trim(),
      description: classData.description?.trim() || null,
    });
  }

  /**
   * 更新分類
   */
  async updateClass(id: number, classData: { class_name?: string; description?: string }) {
    // 驗證分類是否存在
    await this.classRepo.findById(id);

    const updateData: any = {};

    if (classData.class_name !== undefined) {
      if (classData.class_name.trim().length === 0) {
        throw new Error('分類名稱不能為空');
      }
      if (classData.class_name.trim().length > 50) {
        throw new Error('分類名稱不能超過 50 個字元');
      }

      // 檢查分類名稱是否已被其他分類使用
      const existing = await this.classRepo.findAll();
      const duplicate = existing.find(
        (c) => c.class_id !== id && c.class_name.toLowerCase() === classData.class_name.trim().toLowerCase()
      );
      if (duplicate) {
        throw new Error('分類名稱已存在');
      }

      updateData.class_name = classData.class_name.trim();
    }

    if (classData.description !== undefined) {
      updateData.description = classData.description.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('沒有要更新的欄位');
    }

    return this.classRepo.update(id, updateData);
  }

  /**
   * 刪除分類
   */
  async deleteClass(id: number) {
    // 驗證分類是否存在
    await this.classRepo.findById(id);

    // 檢查是否有刊登使用此分類
    const { supabaseAdmin } = await import('@/lib/supabase/admin');
    const { count } = await supabaseAdmin
      .from('posting')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', id);

    if (count && count > 0) {
      throw new Error('無法刪除：仍有刊登使用此分類');
    }

    return this.classRepo.delete(id);
  }
}

