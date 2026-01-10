import { transformSnakeToCamelCase } from './transform.util';

describe('Transform Utility', () => {
  describe('transformSnakeToCamelCase', () => {
    it('should transform simple snake_case keys to camelCase', () => {
      const input = { first_name: 'John', last_name: 'Doe' };
      const expected = { firstName: 'John', lastName: 'Doe' };

      expect(transformSnakeToCamelCase(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        user_name: 'john',
        user_profile: {
          first_name: 'John',
          last_name: 'Doe',
        },
      };

      const expected = {
        userName: 'john',
        userProfile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      expect(transformSnakeToCamelCase(input)).toEqual(expected);
    });

    it('should handle arrays of objects', () => {
      const input = [
        { first_name: 'John', last_name: 'Doe' },
        { first_name: 'Jane', last_name: 'Smith' },
      ];

      const expected = [
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Smith' },
      ];

      expect(transformSnakeToCamelCase(input)).toEqual(expected);
    });

    it('should handle deeply nested structures', () => {
      const input = {
        project_data: {
          project_name: 'My Project',
          project_tasks: [
            { task_id: 1, task_name: 'Task 1' },
            { task_id: 2, task_name: 'Task 2' },
          ],
        },
      };

      const expected = {
        projectData: {
          projectName: 'My Project',
          projectTasks: [
            { taskId: 1, taskName: 'Task 1' },
            { taskId: 2, taskName: 'Task 2' },
          ],
        },
      };

      expect(transformSnakeToCamelCase(input)).toEqual(expected);
    });

    it('should handle null and undefined values', () => {
      expect(transformSnakeToCamelCase(null)).toBeNull();
      expect(transformSnakeToCamelCase(undefined)).toBeUndefined();
    });

    it('should handle primitive values', () => {
      expect(transformSnakeToCamelCase('string')).toBe('string');
      expect(transformSnakeToCamelCase(42)).toBe(42);
      expect(transformSnakeToCamelCase(true)).toBe(true);
    });

    it('should handle empty objects and arrays', () => {
      expect(transformSnakeToCamelCase({})).toEqual({});
      expect(transformSnakeToCamelCase([])).toEqual([]);
    });

    it('should preserve already camelCase keys', () => {
      const input = { firstName: 'John', lastName: 'Doe' };
      const expected = { firstName: 'John', lastName: 'Doe' };

      expect(transformSnakeToCamelCase(input)).toEqual(expected);
    });

    it('should handle mixed snake_case and camelCase keys', () => {
      const input = { first_name: 'John', lastName: 'Doe' };
      const expected = { firstName: 'John', lastName: 'Doe' };

      expect(transformSnakeToCamelCase(input)).toEqual(expected);
    });

    it('should handle keys with multiple underscores', () => {
      const input = { very_long_property_name: 'value' };
      const expected = { veryLongPropertyName: 'value' };

      expect(transformSnakeToCamelCase(input)).toEqual(expected);
    });
  });
});
