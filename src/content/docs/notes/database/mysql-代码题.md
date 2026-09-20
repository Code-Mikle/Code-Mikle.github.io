---
title: mysql 代码题
---



```
第一梯队
GROUP BY + 聚合
WHERE / HAVING
JOIN
子查询
DISTINCT
CASE WHEN

第二梯队
重复数据
第二大 / 第 N 大
每组最大值
分组 Top N

第三梯队
ROW_NUMBER / RANK / DENSE_RANK
LAG / LEAD
累计统计
连续登录
```





## 高频题

### 每组 Top N

```
需统计出每门学科（course）分数（score）最高的两位学生（name）:
张三 语文 90
张三 数学 80
张三 英语 90
李四 语文 91
李四 数学 77
李四 英语 60
...
```

解答如下：

```sql
CREATE DATABASE IF NOT EXISTS practice_db;

CREATE TABLE student_score (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
	`name` VARCHAR(128) NOT NULL,
	score INT DEFAULT 0 NOT NULL
)

ALTER TABLE student_score ADD course VARCHAR(128) DEFAULT NULL AFTER `name`;

INSERT INTO student_score (`name`, course, score) VALUES
	('张三', '语文', 90),
	('张三', '数学', 80),
	('张三', '英语', 76),
	('李四', '语文', 98),
	('李四', '数学', 50),
	('李四', '英语', 45),
	('王五', '语文', 93),
	('王五', '数学', 69),
	('王五', '英语', 70),
	('孙二', '语文', 83),
	('孙二', '数学', 66),
	('孙二', '英语', 82);
	

SELECT `name`, course, score FROM (
	SELECT `name`, course, score, ROW_NUMBER() OVER (
		PARTITION BY course
		ORDER BY score DESC
	) AS rn
	FROM  student_score
) AS t WHERE rn <= 2;
```

注意：

- `ROW_NUMBER` 不管成绩是否相同，每一行都给唯一编号

  ```
  95 -> 1
  95 -> 2
  90 -> 3
  80 -> 4
  ```

- `RANK` 相同值排名相同，但后面的名次会跳号

  ```
  95 -> 1
  95 -> 1
  90 -> 3
  80 -> 4
  ```

- `DENSE_RANK` 相同值排名相同，但后面的名次不跳号

  ```
  95 -> 1
  95 -> 1
  90 -> 2
  80 -> 3
  ```


### 聚合统计

基于 score：

```sql
-- 1. 查询所有学生的平均分
SELECT AVG(score) FROM score;

-- 2. 查询每门课程的平均分
SELECT course_name, AVG(score) 
FROM score, course 
WHERE score.course_id = course.id
GROUP BY course_id

-- 3. 查询每门课程最高分、最低分、平均分
SELECT course_name, MAX(score) max_score, MIN(score) min_score, AVG(score) avg_score
FROM score, course 
WHERE score.course_id = course.id
GROUP BY course_id

-- 4. 查询每门课程参加考试的人数
SELECT course_name, COUNT(course_name)
FROM score, course
WHERE score.course_id = course.id
GROUP BY course_id

-- 5. 查询平均分大于 80 的课程
SELECT course_name
FROM score, course
WHERE score.course_id = course.id
GROUP BY course_id
HAVING AVG(score) > 80

-- 6. 查询参加考试人数大于 8 人的课程
SELECT course_name
FROM score, course
WHERE score.course_id = course.id
GROUP BY course_id
HAVING COUNT(student_id) > 8
```



### `HAVING` 分组后筛选



### 多表 `JOIN`

- `INNER JOIN` 内联结

  只返回两个表中都匹配的行，相当于取两表的"交集"。不匹配的行会被直接过滤掉，结果集中不会出现 NULL 值。

- `LEFT JOIN` 左联结，也可以写为 `LEFT OUTER JOIN` 

  返回左表的所有行，右表有匹配的则显示对应数据，无匹配的则右表字段填充 NULL。

  > 在使用 OUTER JOIN 语法时，必须使用 RIGHT 或 LEFT 关键字指定包括其所有行的表（RIGHT 指出的是 OUTER JOIN 右边的表，而LEFT 指出的是 OUTER JOIN 左边的表）。

- `IS NULL`

  这是一个条件判断表达式，用来筛选某个字段值为 NULL 的行。它最常和 `LEFT JOIN` 搭配使用，用来查找"不存在"的数据。

```sql
-- 7. 查询所有学生姓名、课程名、成绩
-- 写法1：
SELECT `name`, course_name, score
FROM student, score, course
WHERE student.id = score.student_id AND course.id = score.course_id
-- 写法2：
SELECT `name`, course_name, score
FROM student
INNER JOIN score ON student.id = score.student_id
INNER JOIN course ON course.id = score.course_id

-- 8. 查询张三所有课程成绩
SELECT course_name, score
FROM student
INNER JOIN score ON student.id = score.student_id
INNER JOIN course ON course.id = score.course_id
WHERE `name` = '张三';

-- 9. 查询所有学生及其成绩，包括没有成绩的学生
SELECT `name`, course_name, score
FROM student
LEFT OUTER JOIN score ON student.id = score.student_id
LEFT OUTER JOIN course ON course.id = score.course_id

-- 10. 查询没有参加任何考试的学生
SELECT `name`
FROM student
LEFT OUTER JOIN score ON student.id = score.student_id
WHERE score.score IS NULL;

-- 11. 查询没有任何考试记录的课程
SELECT course_name
FROM course
LEFT OUTER JOIN score ON course.id = score.course_id
WHERE score.score IS NULL;

-- 12. 查询只参加了一门考试的学生
SELECT `name`
FROM student
LEFT OUTER JOIN score ON student.id = score.student_id
GROUP BY student.id
HAVING COUNT(score.course_id) = 1;
```

### 子查询 / `EXISTS` / `NOT EXISTS`

| 类型       | 返回结果           | 搭配运算符         | 示例                                             |
| ---------- | ------------------ | ------------------ | ------------------------------------------------ |
| 标量子查询 | 单个值（一行一列） | `=`, `>`, `<`      | `WHERE score > (SELECT AVG(score) FROM student)` |
| 列子查询   | 一列多行           | `IN`, `ANY`, `ALL` | `WHERE id IN (SELECT student_id FROM score)`     |
| 表子查询   | 多行多列（临时表） | 放在 `FROM` 后     | `FROM (SELECT ... ) t`                           |

`EXISTS` 和 `NOT EXISTS`

- `EXISTS`
- `NOT EXISTS`





#### 查找“没有”的数据





### 去重



### 查重复数据



### 删除重复数据



### 最大值 / 第二大值 / 第 N 大值





### 连续登录 / 连续出现



### 相邻行比较



### 累计值



### 每组最大值对应的完整记录



### 条件统计







