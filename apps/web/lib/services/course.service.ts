import { CourseRepository } from '@/lib/repositories/course.repository';

export class CourseService {
  private courseRepo = new CourseRepository();

  /**
   * 取得所有課程
   */
  async getAllCourses() {
    return this.courseRepo.findAll();
  }

  /**
   * 根據關鍵字搜尋課程
   */
  async searchCourses(keyword: string) {
    return this.courseRepo.search(keyword);
  }

  /**
   * 根據 ID 取得課程
   */
  async getCourseById(id: number) {
    return this.courseRepo.findById(id);
  }

  /**
   * 新增課程
   */
  async createCourse(courseData: {
    course_code: string;
    course_name: string;
    dept_id?: number | null;
    class_id?: number | null;
  }) {
    // 驗證課程代碼
    if (!courseData.course_code || courseData.course_code.trim().length === 0) {
      throw new Error('課程代碼不能為空');
    }

    if (courseData.course_code.trim().length > 20) {
      throw new Error('課程代碼不能超過 20 個字元');
    }

    // 驗證課程名稱
    if (!courseData.course_name || courseData.course_name.trim().length === 0) {
      throw new Error('課程名稱不能為空');
    }

    if (courseData.course_name.trim().length > 200) {
      throw new Error('課程名稱不能超過 200 個字元');
    }

    // 檢查課程代碼和名稱的組合是否已存在
    try {
      const existing = await this.courseRepo.findAll();
      const duplicate = existing.find(
        (c) =>
          c.course_code.toLowerCase() === courseData.course_code.trim().toLowerCase() &&
          c.course_name.toLowerCase() === courseData.course_name.trim().toLowerCase()
      );
      if (duplicate) {
        throw new Error('課程代碼和名稱的組合已存在');
      }
    } catch (error: any) {
      if (error.message === '課程代碼和名稱的組合已存在') {
        throw error;
      }
      // 其他錯誤忽略，繼續執行
    }

    return this.courseRepo.create({
      course_code: courseData.course_code.trim(),
      course_name: courseData.course_name.trim(),
      dept_id: courseData.dept_id || null,
      class_id: courseData.class_id || null,
    });
  }

  /**
   * 更新課程
   */
  async updateCourse(
    id: number,
    courseData: {
      course_code?: string;
      course_name?: string;
      dept_id?: number | null;
      class_id?: number | null;
    }
  ) {
    // 驗證課程是否存在
    await this.courseRepo.findById(id);

    const updateData: any = {};

    if (courseData.course_code !== undefined) {
      if (courseData.course_code.trim().length === 0) {
        throw new Error('課程代碼不能為空');
      }
      if (courseData.course_code.trim().length > 20) {
        throw new Error('課程代碼不能超過 20 個字元');
      }
      updateData.course_code = courseData.course_code.trim();
    }

    if (courseData.course_name !== undefined) {
      if (courseData.course_name.trim().length === 0) {
        throw new Error('課程名稱不能為空');
      }
      if (courseData.course_name.trim().length > 200) {
        throw new Error('課程名稱不能超過 200 個字元');
      }
      updateData.course_name = courseData.course_name.trim();
    }

    if (courseData.dept_id !== undefined) {
      updateData.dept_id = courseData.dept_id || null;
    }

    if (courseData.class_id !== undefined) {
      updateData.class_id = courseData.class_id || null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('沒有要更新的欄位');
    }

    // 檢查課程代碼和名稱的組合是否已被其他課程使用
    if (updateData.course_code || updateData.course_name) {
      const current = await this.courseRepo.findById(id);
      const finalCode = updateData.course_code || current.course_code;
      const finalName = updateData.course_name || current.course_name;

      const existing = await this.courseRepo.findAll();
      const duplicate = existing.find(
        (c) =>
          c.course_id !== id &&
          c.course_code.toLowerCase() === finalCode.toLowerCase() &&
          c.course_name.toLowerCase() === finalName.toLowerCase()
      );
      if (duplicate) {
        throw new Error('課程代碼和名稱的組合已存在');
      }
    }

    return this.courseRepo.update(id, updateData);
  }

  /**
   * 刪除課程
   */
  async deleteCourse(id: number) {
    // 驗證課程是否存在
    await this.courseRepo.findById(id);

    // 檢查是否有刊登使用此課程
    const { supabaseAdmin } = await import('@/lib/supabase/admin');
    const { count } = await supabaseAdmin
      .from('posting')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', id);

    if (count && count > 0) {
      throw new Error('無法刪除：仍有刊登使用此課程');
    }

    return this.courseRepo.delete(id);
  }
}

