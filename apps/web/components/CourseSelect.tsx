'use client';

import { useState, useEffect, useRef } from 'react';

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
}

interface CourseSelectProps {
  value: string; // course_id (string)
  onChange: (courseId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function CourseSelect({
  value,
  onChange,
  disabled = false,
  placeholder = '選擇課程',
}: CourseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 載入所有課程
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses');
        const result = await response.json();

        if (result.success) {
          setCourses(result.data || []);
          setFilteredCourses(result.data || []);
        }
      } catch (error) {
        console.error('載入課程失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // 根據選擇的 course_id 設定選中的課程
  useEffect(() => {
    if (value && courses.length > 0) {
      const course = courses.find((c) => c.course_id.toString() === value);
      setSelectedCourse(course || null);
      if (course) {
        setSearchKeyword(course.course_name);
      }
    } else {
      setSelectedCourse(null);
      setSearchKeyword('');
    }
  }, [value, courses]);

  // 搜尋課程（使用 debounce）
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (searchKeyword.trim() === '') {
        setFilteredCourses(courses);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/courses?search=${encodeURIComponent(searchKeyword)}`);
        const result = await response.json();

        if (result.success) {
          setFilteredCourses(result.data || []);
        }
      } catch (error) {
        console.error('搜尋課程失敗:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchKeyword, courses]);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // 如果沒有選擇課程，恢復顯示已選擇的課程名稱
        if (selectedCourse) {
          setSearchKeyword(selectedCourse.course_name);
        } else {
          setSearchKeyword('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedCourse]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setSearchKeyword(course.course_name);
    onChange(course.course_id.toString());
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev < filteredCourses.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCourses[highlightedIndex]) {
          handleSelectCourse(filteredCourses[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        if (selectedCourse) {
          setSearchKeyword(selectedCourse.course_name);
        } else {
          setSearchKeyword('');
        }
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchKeyword}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500 text-center">載入中...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500 text-center">
              找不到相關課程
            </div>
          ) : (
            <ul className="py-1" role="listbox">
              {filteredCourses.map((course, index) => (
                <li
                  key={course.course_id}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onClick={() => handleSelectCourse(course)}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                    highlightedIndex === index ? 'bg-blue-50' : ''
                  } ${
                    selectedCourse?.course_id === course.course_id
                      ? 'bg-blue-100 font-medium'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{course.course_name}</span>
                    <span className="text-sm text-gray-500">{course.course_code}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

